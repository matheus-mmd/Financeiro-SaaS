'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Categorias de emojis organizadas por tema
const emojiCategories = {
  'Dinheiro': ['💰', '💵', '💴', '💶', '💷', '💸', '💳', '🏦', '🪙', '💎', '📈', '📉', '💹', '🏧', '💲'],
  'Trabalho': ['💼', '🏢', '👔', '📊', '📋', '✏️', '📁', '🖥️', '⌨️', '🖨️', '📠', '💻', '🎯', '📌', '📍'],
  'Casa': ['🏠', '🏡', '🏘️', '🛋️', '🛏️', '🚿', '🛁', '🪑', '🚪', '🪟', '🧹', '🧺', '🔑', '🏗️', '🔧'],
  'Comida': ['🍔', '🍕', '🍣', '🍜', '🍲', '🥗', '🥘', '🍳', '🥚', '🍞', '🥛', '☕', '🍺', '🍷', '🧃'],
  'Transporte': ['🚗', '🚕', '🚌', '🚇', '🚆', '✈️', '🚢', '🏍️', '🚲', '🛵', '⛽', '🚦', '🛣️', '🚏', '🅿️'],
  'Saúde': ['💊', '🏥', '🩺', '💉', '🩹', '🧬', '🦷', '👓', '🩻', '🏋️', '🧘', '🚴', '🏃', '💪', '❤️'],
  'Educação': ['📚', '📖', '🎓', '✏️', '📝', '🖊️', '📐', '📏', '🔬', '🔭', '🧮', '💡', '🎨', '🎭', '🎪'],
  'Lazer': ['🎮', '🎬', '🎤', '🎧', '🎸', '🎹', '🎲', '🎯', '🎳', '⚽', '🏀', '🎾', '🏈', '⛳', '🎣'],
  'Compras': ['🛒', '🛍️', '🏪', '🏬', '👗', '👠', '👜', '💄', '🧴', '📱', '⌚', '💍', '🎁', '📦', '🏷️'],
  'Viagens': ['✈️', '🏖️', '🏔️', '🗺️', '🧳', '🏕️', '🎢', '🗼', '🗽', '🏰', '🎡', '🌴', '🌊', '⛱️', '🚀'],
  'Pet': ['🐕', '🐈', '🐦', '🐠', '🐹', '🐰', '🦜', '🐢', '🦎', '🐍', '🦔', '🐾', '🦴', '🐟', '🪺'],
  'Outros': ['⭐', '🌟', '✨', '🔥', '💯', '❤️', '💚', '💙', '💜', '🧡', '🤍', '🖤', '❓', '❗', '✅'],
};

const categoryNames = Object.keys(emojiCategories);

export default function EmojiPicker({ selectedEmoji, onEmojiSelect, onClose }) {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

  const currentCategory = categoryNames[currentCategoryIndex];
  const emojis = emojiCategories[currentCategory];

  const goToPrevCategory = () => {
    setCurrentCategoryIndex((prev) =>
      prev === 0 ? categoryNames.length - 1 : prev - 1
    );
  };

  const goToNextCategory = () => {
    setCurrentCategoryIndex((prev) =>
      prev === categoryNames.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-4 w-full max-w-sm">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={goToPrevCategory}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {categoryNames.slice(
            Math.max(0, currentCategoryIndex - 1),
            Math.min(categoryNames.length, currentCategoryIndex + 3)
          ).map((cat, idx) => {
            const actualIndex = Math.max(0, currentCategoryIndex - 1) + idx;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCurrentCategoryIndex(actualIndex)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                  actualIndex === currentCategoryIndex
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={goToNextCategory}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Emoji Grid */}
      <div className="grid grid-cols-5 gap-2">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => {
              onEmojiSelect(emoji);
              onClose?.();
            }}
            className={`w-10 h-10 flex items-center justify-center text-2xl rounded-lg transition-all hover:bg-gray-100 ${
              selectedEmoji === emoji ? 'bg-brand-100 ring-2 ring-brand-500' : ''
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

// Export the categories for use in default categories
export { emojiCategories };