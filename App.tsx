import React, { useState, useEffect } from 'react';
import { Recipe, ViewState } from './types';
import * as storage from './services/storageService';
import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail';
import RecipeForm from './components/RecipeForm';
import { ChefHat } from 'lucide-react';

const App: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [view, setView] = useState<ViewState>('LIST');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Load data on mount
  useEffect(() => {
    const data = storage.getRecipes();
    setRecipes(data);
  }, []);

  // Navigation Handlers
  const goToList = () => {
    setView('LIST');
    setSelectedRecipe(null);
    // Refresh data in case of updates
    setRecipes(storage.getRecipes());
  };

  const goToDetail = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setView('DETAIL');
  };

  const goToCreate = () => {
    setSelectedRecipe(null);
    setView('CREATE');
  };

  const goToEdit = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setView('EDIT');
  };

  // Data Actions
  const handleSaveRecipe = (recipe: Recipe) => {
    storage.saveRecipe(recipe);
    if (view === 'EDIT') {
        setSelectedRecipe(recipe); // Update view with new data
        setView('DETAIL');
    } else {
        goToList();
    }
  };

  const handleDeleteRecipe = (id: string) => {
    storage.deleteRecipe(id);
    goToList();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-orange-100 selection:text-orange-900">
      
      {/* App Header (Only visible on List view to mimic mobile app navigation stack) */}
      {view === 'LIST' && (
        <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-orange-600 p-2 rounded-lg">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">ChefNote 厨记</span>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {view === 'LIST' && (
          <RecipeList 
            recipes={recipes} 
            onSelect={goToDetail} 
            onCreate={goToCreate}
          />
        )}

        {view === 'DETAIL' && selectedRecipe && (
          <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-6">
             <RecipeDetail 
                recipe={selectedRecipe}
                onBack={goToList}
                onEdit={goToEdit}
                onDelete={handleDeleteRecipe}
             />
          </div>
        )}

        {(view === 'CREATE' || view === 'EDIT') && (
           <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-6">
            <RecipeForm 
                initialRecipe={selectedRecipe}
                onSave={handleSaveRecipe}
                onCancel={selectedRecipe ? () => goToDetail(selectedRecipe) : goToList}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;