import React, { useRef, useState } from 'react';
import { Recipe } from '../types';
import { ArrowLeft, Edit2, FileDown, Clock, Users, Trash2, X, Loader2, Printer } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onBack, onEdit, onDelete }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (type: 'single' | 'multi') => {
    if (!contentRef.current) return;
    
    setIsExporting(true);
    // Give UI a moment to update
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const element = contentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Attempt to load cross-origin images
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgWidthPx = canvas.width;
      const imgHeightPx = canvas.height;

      if (type === 'single') {
        // Single Long Page PDF
        // Convert px to pt (approx 0.75) or just use unit 'px' in jsPDF
        const pdf = new jsPDF({
          orientation: 'p',
          unit: 'px',
          format: [imgWidthPx, imgHeightPx]
        });
        
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidthPx, imgHeightPx);
        pdf.save(`${recipe.title}_长图.pdf`);

      } else {
        // A4 Multi-Page PDF
        // A4 size in mm: 210 x 297
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidthMm = 210;
        const pageHeightMm = 297;
        
        // Calculate image height in mm based on A4 width
        const imgHeightMm = (imgHeightPx * pageWidthMm) / imgWidthPx;
        
        let heightLeft = imgHeightMm;
        let position = 0;

        // Add first page
        pdf.addImage(imgData, 'JPEG', 0, position, pageWidthMm, imgHeightMm);
        heightLeft -= pageHeightMm;

        // Add subsequent pages if content overflows
        while (heightLeft > 0) {
          position = heightLeft - imgHeightMm; // Pull image up
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, pageWidthMm, imgHeightMm);
          heightLeft -= pageHeightMm;
        }

        pdf.save(`${recipe.title}_A4打印.pdf`);
      }

      setShowExportModal(false);
    } catch (error) {
      console.error("Export failed", error);
      alert("导出失败，请重试。如果图片加载失败可能导致此问题。");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen pb-20 animate-fade-in relative">
      
      {/* Export Modal Overlay */}
      {showExportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Printer className="w-5 h-5 text-orange-600" />
                导出 PDF 选项
              </h3>
              <button onClick={() => !isExporting && setShowExportModal(false)} disabled={isExporting}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500 mb-2">
                请选择您需要的 PDF 格式：
              </p>
              
              <button 
                onClick={() => handleExport('single')}
                disabled={isExporting}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all group text-left"
              >
                <div>
                  <div className="font-bold text-gray-800 group-hover:text-orange-700">长图 PDF</div>
                  <div className="text-xs text-gray-500 mt-1">单页完整显示，适合手机/平板阅读分享</div>
                </div>
                <FileDown className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
              </button>

              <button 
                onClick={() => handleExport('multi')}
                disabled={isExporting}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all group text-left"
              >
                <div>
                  <div className="font-bold text-gray-800 group-hover:text-orange-700">A4 分页 PDF</div>
                  <div className="text-xs text-gray-500 mt-1">标准 A4 尺寸分页，适合打印归档</div>
                </div>
                <Printer className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
              </button>
            </div>

            {isExporting && (
              <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center text-orange-600 font-medium z-10">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                正在生成 PDF...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content (Wrapped in Ref for Capture) */}
      <div ref={contentRef} className="bg-white">
        {/* Hero Image / Header */}
        <div className="relative h-72 w-full bg-gray-200 print:h-64">
          {/* Note: Cross-origin images might taint canvas. Ensure images allow CORS or use local assets. */}
          <img
            src={recipe.coverImage || `https://picsum.photos/seed/${recipe.id}/1200/800`}
            alt={recipe.title}
            className="w-full h-full object-cover"
            crossOrigin="anonymous" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          
          <button
            onClick={onBack}
            data-html2canvas-ignore="true" 
            className="absolute top-4 left-4 p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="absolute bottom-0 left-0 w-full p-6 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 shadow-sm">{recipe.title}</h1>
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-md text-xs font-medium border border-white/10">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          {recipe.description && (
            <p className="text-gray-600 italic text-lg mb-8 leading-relaxed border-l-4 border-orange-500 pl-4">
              "{recipe.description}"
            </p>
          )}

          <div className="grid md:grid-cols-[1fr_2fr] gap-10">
            {/* Ingredients Column */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-8 h-1 bg-orange-500 rounded-full mr-3"></span>
                食材清单
              </h2>
              <div className="bg-orange-50/50 rounded-2xl p-6 border border-orange-100">
                <ul className="space-y-3">
                  {recipe.ingredients.map((ing, idx) => (
                    <li key={idx} className="flex justify-between items-center text-gray-700 border-b border-orange-100 pb-2 last:border-0 last:pb-0">
                      <span className="font-medium">{ing.name}</span>
                      <span className="text-gray-500 text-sm whitespace-nowrap ml-4">{ing.amount} <small>{ing.unit}</small></span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Steps Column */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-8 h-1 bg-orange-500 rounded-full mr-3"></span>
                烹饪步骤
              </h2>
              <div className="space-y-8">
                {recipe.steps.map((step, idx) => (
                  <div key={idx} className="relative pl-8 border-l-2 border-gray-200 break-inside-avoid">
                    <div className="absolute -left-[9px] top-0 bg-white border-2 border-orange-500 text-orange-600 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold" />
                    <div className="mb-1 text-sm font-bold text-orange-600 uppercase tracking-wider">步骤 {idx + 1}</div>
                    <p className="text-gray-700 leading-relaxed text-lg">{step.instruction}</p>
                    {step.image && (
                      <img src={step.image} alt={`Step ${idx+1}`} className="mt-4 rounded-xl shadow-md max-h-60 object-cover w-full" crossOrigin="anonymous" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Footer timestamp for PDF */}
          <div className="mt-12 pt-6 border-t border-gray-100 text-center text-gray-400 text-sm">
            Generated by ChefNote • {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div 
        data-html2canvas-ignore="true" 
        className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md shadow-2xl border border-gray-200 rounded-full px-6 py-3 flex gap-4 items-center z-50"
      >
        <button 
          onClick={() => setShowExportModal(true)}
          className="flex items-center gap-2 text-gray-700 hover:text-orange-600 font-medium transition-colors px-2"
          title="导出 PDF"
        >
          <FileDown className="w-5 h-5" />
          <span className="hidden sm:inline">导出 PDF</span>
        </button>
        <div className="w-px h-6 bg-gray-300"></div>
        <button 
          onClick={() => onEdit(recipe)}
          className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-colors px-2"
        >
          <Edit2 className="w-5 h-5" />
          <span className="hidden sm:inline">编辑</span>
        </button>
        <div className="w-px h-6 bg-gray-300"></div>
        <button 
          onClick={() => {
            if(confirm("确定要删除这个菜谱吗？")) onDelete(recipe.id);
          }}
          className="flex items-center gap-2 text-gray-700 hover:text-red-600 font-medium transition-colors px-2"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default RecipeDetail;