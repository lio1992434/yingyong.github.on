import React, { useState, useMemo } from 'react';
import { Recipe } from '../types';
import { Search, Plus, Tag, Clock } from 'lucide-react';

interface RecipeListProps {
  recipes: Recipe[];
  onSelect: (recipe: Recipe) => void;
  onCreate: () => void;
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes, onSelect, onCreate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    recipes.forEach(r => r.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [recipes]);

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            recipe.ingredients.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesTag = selectedTag ? recipe.tags.includes(selectedTag) : true;
      return matchesSearch && matchesTag;
    });
  }, [recipes, searchTerm, selectedTag]);

  return (
    <div className="space-y-6 pb-20">
      {/* Search and Filter Header */}
      <div className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm pt-4 pb-2 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="搜索菜谱或食材..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border-none shadow-sm bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tags ScrollView */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedTag === null
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            全部
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedTag === tag
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map(recipe => (
          <div
            key={recipe.id}
            onClick={() => onSelect(recipe)}
            className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 flex flex-col"
          >
            <div className="relative h-48 overflow-hidden bg-gray-200">
              <img
                src={recipe.coverImage || `https://picsum.photos/seed/${recipe.id}/800/600`}
                alt={recipe.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">
                {recipe.title}
              </h3>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {recipe.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="inline-flex items-center text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded-md">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
                {recipe.tags.length > 3 && (
                   <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-md">+{recipe.tags.length - 3}</span>
                )}
              </div>

              <div className="mt-auto flex items-center justify-between text-sm text-gray-400">
                 <span className="flex items-center">
                   <Clock className="w-3.5 h-3.5 mr-1" />
                   {new Date(recipe.createdAt).toLocaleDateString()}
                 </span>
                 <span>{recipe.ingredients.length} 项食材</span>
              </div>
            </div>
          </div>
        ))}
        
        {filteredRecipes.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg">没有找到相关菜谱。</p>
            <button 
              onClick={onCreate}
              className="mt-4 text-orange-600 font-medium hover:underline"
            >
              新建一个？
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={onCreate}
        className="fixed bottom-8 right-8 bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 z-50 flex items-center justify-center"
        aria-label="Add Recipe"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default RecipeList;