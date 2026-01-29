export type Category = string;

export interface Ingredient {
    id: string;
    name: string;
    price: number;
    image: string;
    category: Category;
    isDefault?: boolean; // If true, usually included in base price or standard selection
}

export interface PresetDish {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    image: string;
    defaultIngredients: string[]; // IDs of ingredients included
}

export const ingredients: Ingredient[] = [
    // Proteins
    { id: 'milanesa-res', name: 'Milanesa de Res', price: 15, category: 'proteins', image: '/images/silpancho_1769650907952.png' },
    { id: 'costillas-cerdo', name: 'Costillas de Cerdo', price: 20, category: 'proteins', image: '/images/chicharron_cerdo_1769650922110.png' },
    { id: 'presa-pollo', name: 'Presa de Pollo', price: 12, category: 'proteins', image: '/images/pollo_picante_1769650936638.png' },
    { id: 'bife', name: 'Bife a la Parrilla', price: 18, category: 'proteins', image: '/images/bife.png' },
    { id: 'chorizo', name: 'Chorizo Frito', price: 8, category: 'proteins', image: '/images/chorizo.png' },
    { id: 'huevo-frito', name: 'Huevo Frito', price: 2, category: 'proteins', image: '/images/silpancho_1769650907952.png' }, // Reuse

    // Carbs (Guarniciones)
    { id: 'arroz', name: 'Arroz Blanco', price: 5, category: 'carbs', image: '/images/arroz_queso_1769650956432.png' },
    { id: 'arroz-queso', name: 'Arroz con Queso', price: 8, category: 'carbs', image: '/images/arroz_queso_1769650956432.png' },
    { id: 'papa-hervida', name: 'Papa Hervida', price: 4, category: 'carbs', image: '/images/chuno_1769651025618.png' },
    { id: 'papa-frita', name: 'Papas Fritas', price: 6, category: 'carbs', image: '/images/yuca_frita_1769650969508.png' }, // Placeholder
    { id: 'yuca', name: 'Yuca Frita', price: 6, category: 'carbs', image: '/images/yuca_frita_1769650969508.png' },
    { id: 'chuno', name: 'Chuño Phuti', price: 6, category: 'carbs', image: '/images/chuno_1769651025618.png' },
    { id: 'fideo', name: 'Fideos', price: 6, category: 'carbs', image: '/images/fideos.png' },
    { id: 'mote', name: 'Mote de Maíz', price: 4, category: 'carbs', image: '/images/somo_1769651070365.png' }, // Placeholder

    // Salads
    { id: 'ensalada-rusa', name: 'Ensalada Rusa', price: 5, category: 'salads', image: '/images/ensalada_rusa.png' },
    { id: 'ensalada-mixta', name: 'Ensalada Mixta', price: 4, category: 'salads', image: '/images/ensalada_mixta.png' },
    { id: 'salsa-criolla', name: 'Salsa Criolla', price: 3, category: 'salads', image: '/images/silpancho_1769650907952.png' }, // Reuse 

    // Sauces
    { id: 'llajua', name: 'Llajua', price: 0, category: 'sauces', image: '/images/llajua_1769650984020.png' },
    { id: 'mani', name: 'Salsa de Maní', price: 0, category: 'sauces', image: '/images/salsa_de_mani_1769651039516.png' },

    // Drinks
    { id: 'mocochinchi', name: 'Mocochinchi', price: 5, category: 'drinks', image: '/images/mocochinchi_1769651055561.png' },
    { id: 'somo', name: 'Somó', price: 6, category: 'drinks', image: '/images/somo_1769651070365.png' },
    { id: 'soda', name: 'Coca Cola 2L', price: 15, category: 'drinks', image: '/images/chuflay_1769651083777.png' } // Placeholder
];

export const dishPresets: PresetDish[] = [
    {
        id: 'silpancho',
        name: 'Silpancho Cochabambino',
        description: 'El clásico valluno. Milanesa gigante, arroz, papas, huevo y ensalada.',
        basePrice: 35, // Discounted vs individual items?
        image: '/images/silpancho_1769650907952.png',
        defaultIngredients: ['milanesa-res', 'arroz', 'papa-hervida', 'huevo-frito', 'salsa-criolla', 'llajua']
    },
    {
        id: 'chicharron',
        name: 'Chicharrón de Cerdo',
        description: 'Costillas crocantes con mote, chuño y llajua.',
        basePrice: 45,
        image: '/images/chicharron_cerdo_1769650922110.png',
        defaultIngredients: ['costillas-cerdo', 'mote', 'chuno', 'llajua']
    },
    {
        id: 'picante-pollo',
        name: 'Picante de Pollo',
        description: 'Pollo en salsa roja con chuño y arroz.',
        basePrice: 38,
        image: '/images/pollo_picante_1769650936638.png',
        defaultIngredients: ['presa-pollo', 'arroz', 'chuno', 'salsa-criolla', 'llajua']
    },
    {
        id: 'custom',
        name: 'Armar mi Plato',
        description: 'Elige tus ingredientes desde cero.',
        basePrice: 0,
        image: '/images/bife.png',
        defaultIngredients: []
    }
];
