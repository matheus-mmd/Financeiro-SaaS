"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { getIconComponent } from "./IconPicker";
import {
  // Finanças e Dinheiro
  Wallet, DollarSign, CreditCard, Banknote, PiggyBank, CircleDollarSign,
  Coins, TrendingUp, TrendingDown, Receipt,

  // Casa e Moradia
  Home, Building, Building2, Warehouse, Key, Hotel,

  // Transporte
  Car, Bus, Bike, Plane, Train, Ship, Fuel, ParkingCircle,

  // Alimentação
  Utensils, Coffee, Pizza, Apple, ShoppingCart, Beef, IceCream,

  // Saúde e Bem-estar
  Heart, Activity, Pill, Stethoscope, Thermometer, Dumbbell, Accessibility,

  // Educação e Trabalho
  GraduationCap, BookOpen, Briefcase, Laptop, BookMarked, School, Backpack,

  // Lazer e Entretenimento
  Film, Music, Gamepad2, PartyPopper, Camera, Tv, Headphones,

  // Compras
  ShoppingBag, Gift, Package, Shirt, Watch, ShoppingBasket, Store,

  // Serviços e Utilidades
  Wrench, Hammer, Settings, Zap, Droplet, Wifi, Phone, Smartphone,

  // Família e Pessoas
  Users, Baby, Dog, Cat,

  // Impostos e Taxas
  FileText, Calculator, Scale, Landmark, BadgeDollarSign,

  // Investimentos
  LineChart, BarChart3, PieChart, Target, Gem, Lock, Shield,

  // Geral
  Tag, Star, CheckCircle, AlertCircle, HelpCircle, Info,
  Calendar, Clock, MapPin, Globe, MessageCircle,
} from "lucide-react";

// Lista de ícones disponíveis organizados por categoria
const ICON_CATEGORIES = {
  "Finanças": [
    { name: "Wallet", icon: Wallet },
    { name: "DollarSign", icon: DollarSign },
    { name: "CircleDollarSign", icon: CircleDollarSign },
    { name: "CreditCard", icon: CreditCard },
    { name: "Banknote", icon: Banknote },
    { name: "PiggyBank", icon: PiggyBank },
    { name: "Coins", icon: Coins },
    { name: "TrendingUp", icon: TrendingUp },
    { name: "TrendingDown", icon: TrendingDown },
    { name: "Receipt", icon: Receipt },
  ],
  "Moradia": [
    { name: "Home", icon: Home },
    { name: "Building", icon: Building },
    { name: "Building2", icon: Building2 },
    { name: "Warehouse", icon: Warehouse },
    { name: "Key", icon: Key },
    { name: "Hotel", icon: Hotel },
  ],
  "Transporte": [
    { name: "Car", icon: Car },
    { name: "Bus", icon: Bus },
    { name: "Bike", icon: Bike },
    { name: "Plane", icon: Plane },
    { name: "Train", icon: Train },
    { name: "Ship", icon: Ship },
    { name: "Fuel", icon: Fuel },
    { name: "ParkingCircle", icon: ParkingCircle },
  ],
  "Alimentação": [
    { name: "Utensils", icon: Utensils },
    { name: "Coffee", icon: Coffee },
    { name: "Pizza", icon: Pizza },
    { name: "Apple", icon: Apple },
    { name: "ShoppingCart", icon: ShoppingCart },
    { name: "Beef", icon: Beef },
    { name: "IceCream", icon: IceCream },
  ],
  "Saúde": [
    { name: "Heart", icon: Heart },
    { name: "Activity", icon: Activity },
    { name: "Pill", icon: Pill },
    { name: "Stethoscope", icon: Stethoscope },
    { name: "Thermometer", icon: Thermometer },
    { name: "Dumbbell", icon: Dumbbell },
    { name: "Accessibility", icon: Accessibility },
  ],
  "Educação": [
    { name: "GraduationCap", icon: GraduationCap },
    { name: "BookOpen", icon: BookOpen },
    { name: "Briefcase", icon: Briefcase },
    { name: "Laptop", icon: Laptop },
    { name: "BookMarked", icon: BookMarked },
    { name: "School", icon: School },
    { name: "Backpack", icon: Backpack },
  ],
  "Lazer": [
    { name: "Film", icon: Film },
    { name: "Music", icon: Music },
    { name: "Gamepad2", icon: Gamepad2 },
    { name: "PartyPopper", icon: PartyPopper },
    { name: "Camera", icon: Camera },
    { name: "Tv", icon: Tv },
    { name: "Headphones", icon: Headphones },
  ],
  "Compras": [
    { name: "ShoppingBag", icon: ShoppingBag },
    { name: "Gift", icon: Gift },
    { name: "Package", icon: Package },
    { name: "Shirt", icon: Shirt },
    { name: "Watch", icon: Watch },
    { name: "ShoppingBasket", icon: ShoppingBasket },
    { name: "Store", icon: Store },
  ],
  "Serviços": [
    { name: "Wrench", icon: Wrench },
    { name: "Hammer", icon: Hammer },
    { name: "Settings", icon: Settings },
    { name: "Zap", icon: Zap },
    { name: "Droplet", icon: Droplet },
    { name: "Wifi", icon: Wifi },
    { name: "Phone", icon: Phone },
    { name: "Smartphone", icon: Smartphone },
  ],
  "Família": [
    { name: "Users", icon: Users },
    { name: "Baby", icon: Baby },
    { name: "Dog", icon: Dog },
    { name: "Cat", icon: Cat },
  ],
  "Impostos": [
    { name: "FileText", icon: FileText },
    { name: "Calculator", icon: Calculator },
    { name: "Scale", icon: Scale },
    { name: "Landmark", icon: Landmark },
    { name: "BadgeDollarSign", icon: BadgeDollarSign },
  ],
  "Investimentos": [
    { name: "LineChart", icon: LineChart },
    { name: "BarChart3", icon: BarChart3 },
    { name: "PieChart", icon: PieChart },
    { name: "Target", icon: Target },
    { name: "Gem", icon: Gem },
    { name: "Lock", icon: Lock },
    { name: "Shield", icon: Shield },
  ],
  "Geral": [
    { name: "Tag", icon: Tag },
    { name: "Star", icon: Star },
    { name: "CheckCircle", icon: CheckCircle },
    { name: "AlertCircle", icon: AlertCircle },
    { name: "HelpCircle", icon: HelpCircle },
    { name: "Info", icon: Info },
    { name: "Calendar", icon: Calendar },
    { name: "Clock", icon: Clock },
    { name: "MapPin", icon: MapPin },
    { name: "Globe", icon: Globe },
    { name: "MessageCircle", icon: MessageCircle },
  ],
};

export default function IconPickerModal({ open, onOpenChange, selectedIcon = "Tag", onIconSelect, color = "#6366f1" }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Função para filtrar ícones baseado na busca
  const filterIcons = () => {
    if (!searchTerm) return ICON_CATEGORIES;

    const filtered = {};
    Object.entries(ICON_CATEGORIES).forEach(([category, icons]) => {
      const matchedIcons = icons.filter(icon =>
        icon.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matchedIcons.length > 0) {
        filtered[category] = matchedIcons;
      }
    });
    return filtered;
  };

  const filteredCategories = filterIcons();

  const handleIconSelect = (iconName) => {
    onIconSelect(iconName);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Escolher Ícone</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Campo de busca */}
          <div className="space-y-2">
            <Label>Buscar Ícone</Label>
            <Input
              type="text"
              placeholder="Ex: wallet, home, car..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Grid de ícones por categoria */}
          <div className="max-h-[50vh] overflow-y-auto border border-gray-200 rounded-lg">
            {Object.entries(filteredCategories).map(([category, icons]) => (
              <div key={category} className="border-b border-gray-200 last:border-b-0">
                <button
                  type="button"
                  onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-700">{category}</span>
                  <span className="text-sm text-gray-500">
                    {expandedCategory === category ? "▼" : "▶"} {icons.length}
                  </span>
                </button>

                {(expandedCategory === category || searchTerm) && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 p-3 bg-gray-50">
                    {icons.map((icon) => {
                      const IconComponent = icon.icon;
                      const isSelected = icon.name === selectedIcon;

                      return (
                        <button
                          key={icon.name}
                          type="button"
                          onClick={() => handleIconSelect(icon.name)}
                          className={`
                            p-3 rounded-lg transition-all hover:scale-110
                            ${isSelected
                              ? 'bg-brand-100 ring-2 ring-brand-500 shadow-md'
                              : 'bg-white hover:bg-gray-100 border border-gray-200'
                            }
                          `}
                          title={icon.name}
                        >
                          <IconComponent
                            className={`w-5 h-5 ${isSelected ? 'text-brand-600' : 'text-gray-600'}`}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {Object.keys(filteredCategories).length === 0 && (
              <div className="p-8 text-center text-gray-500">
                Nenhum ícone encontrado para "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}