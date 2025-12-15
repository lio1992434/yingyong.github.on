import React, { useState, useRef } from 'react';
import { Recipe, Ingredient, Step } from '../types';
import { ArrowLeft, Plus, X, Upload, Sparkles, Loader2, Save } from 'lucide-react';
import { generateRecipeFromIdea } from '../services/geminiService';

interface RecipeFormProps {
  initialRecipe?: Recipe | null;
  onSave: (recipe: Recipe) => void;
  onCancel: () => void;
}

const emptyIngredient: Ingredient = { name: '', amount: '', unit: '' };
const emptyStep: Step = { instruction: '', image: '' };

const RecipeForm: React.FC<RecipeFormProps> = ({ initialRecipe, onSave, onCancel }) => {
  const [title, setTitle] = useState(initialRecipe?.title || '');
  const [description, setDescription] = useState(initialRecipe?.description || '');
  const [tags, setTags] = useState(initialRecipe?.tags.join(', ') || '');
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialRecipe?.ingredients || [{ ...emptyIngredient }]);
  const [steps, setSteps] = useState<Step[]>(initialRecipe?.steps || [{ ...emptyStep }]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);

  // Handlers
  const handleAddIngredient = () => setIngredients([...ingredients, { ...emptyIngredient }]);
  const handleRemoveIngredient = (index: number) => setIngredients(ingredients.filter((_, i) => i !== index));
  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const newIngs = [...ingredients];
    newIngs[index] = { ...newIngs[index], [field]: value };
    setIngredients(newIngs);
  };

  const handleAddStep = () => setSteps([...steps, { ...emptyStep }]);
  const handleRemoveStep = (index: number) => setSteps(steps.filter((_, i) => i !== index));
  const updateStep = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], instruction: value };
    setSteps(newSteps);
  };

  const handleSave = () => {
    if (!title) return alert('请输入菜谱名称');
    const newRecipe: Recipe = {
      id: initialRecipe?.id || crypto.randomUUID(),
      title,
      description,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      ingredients: ingredients.filter(i => i.name),
      steps: steps.filter(s => s.instruction),
      createdAt: initialRecipe?.createdAt || Date.now(),
      updatedAt: Date.now(),
      coverImage: initialRecipe?.coverImage // Preserve existing or let default handle it
    };
    onSave(newRecipe);
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    const result = await generateRecipeFromIdea(aiPrompt);
    setIsGenerating(false);
    setShowAiModal(false);

    if (result) {
      if (result.title) setTitle(result.title);
      if (result.description) setDescription(result.description);
      if (result.tags) setTags(result.tags.join(', '));
      if (result.ingredients) setIngredients(result.ingredients as Ingredient[]);
      if (result.steps) setSteps(result.steps as Step[]);
    } else {
      alert("生成失败，请重试。");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">{initialRecipe ? '编辑菜谱' : '新建菜谱'}</h1>
        </div>
        <div className="flex items-center gap-2">
           {!initialRecipe && (
             <button 
                onClick={() => setShowAiModal(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors mr-2"
              >
               <Sparkles className="w-4 h-4" />
               AI 大厨
             </button>
           )}
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            保存
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        
        {/* Basic Info */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
           {!initialRecipe && (
             <button 
                onClick={() => setShowAiModal(true)}
                className="sm:hidden w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors mb-4 border border-indigo-100 dashed"
              >
               <Sparkles className="w-4 h-4" />
               AI 智能填充
             </button>
           )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">菜谱名称</label>
            <input 
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="例如：红烧肉"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">简介</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="关于这道菜的故事..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none h-24 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标签（用逗号分隔）</label>
            <input 
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="家常菜, 辣, 简单"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
        </section>

        {/* Ingredients */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">食材清单</h3>
          <div className="space-y-3">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <input 
                  value={ing.name}
                  onChange={e => updateIngredient(idx, 'name', e.target.value)}
                  placeholder="名称" 
                  className="flex-[2] px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 outline-none"
                />
                <input 
                  value={ing.amount}
                  onChange={e => updateIngredient(idx, 'amount', e.target.value)}
                  placeholder="数量" 
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 outline-none"
                />
                <input 
                  value={ing.unit}
                  onChange={e => updateIngredient(idx, 'unit', e.target.value)}
                  placeholder="单位" 
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 outline-none"
                />
                <button onClick={() => handleRemoveIngredient(idx)} className="p-2 text-gray-400 hover:text-red-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          <button onClick={handleAddIngredient} className="mt-4 flex items-center text-sm text-orange-600 font-medium hover:text-orange-700">
            <Plus className="w-4 h-4 mr-1" /> 添加食材
          </button>
        </section>

        {/* Steps */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">烹饪步骤</h3>
          <div className="space-y-6">
            {steps.map((step, idx) => (
              <div key={idx} className="relative pl-8 border-l-2 border-gray-200">
                 <div className="absolute -left-[9px] top-2 bg-gray-100 border-2 border-gray-300 text-gray-500 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold">
                    {idx + 1}
                 </div>
                <div className="flex gap-2 items-start">
                  <textarea 
                    value={step.instruction}
                    onChange={e => updateStep(idx, e.target.value)}
                    placeholder={`步骤 ${idx + 1} 描述...`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 outline-none h-20 resize-none"
                  />
                  <button onClick={() => handleRemoveStep(idx)} className="p-2 text-gray-400 hover:text-red-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={handleAddStep} className="mt-4 flex items-center text-sm text-orange-600 font-medium hover:text-orange-700">
            <Plus className="w-4 h-4 mr-1" /> 添加步骤
          </button>
        </section>
      </div>

      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2 text-indigo-700">
                <Sparkles className="w-5 h-5" /> AI 厨师助手
              </h3>
              <button onClick={() => setShowAiModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              输入菜名（例如“宫保鸡丁”）或粘贴食材列表，我来为您生成完整菜谱。
            </p>

            <textarea 
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              placeholder="描述你想做什么..."
              className="w-full border border-gray-300 rounded-xl p-3 h-32 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
            />

            <button 
              onClick={handleAiGenerate}
              disabled={isGenerating || !aiPrompt.trim()}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : '生成菜谱'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeForm;