// Regiones y comunas de Chile y Perú
export interface Comuna {
  id: string;
  name: string;
}

export interface Region {
  id: string;
  name: string;
  comunas: Comuna[];
  country: 'Chile' | 'Peru';
}

export const chilePeruRegionsCommunes: Region[] = [
  {
    id: "13",
    name: "Región Metropolitana de Santiago",
    country: "Chile",
    comunas: [
      { id: "13101", name: "Santiago" },
      { id: "13102", name: "Cerrillos" },
      { id: "13119", name: "Maipú" },
      { id: "13123", name: "Providencia" },
      { id: "13114", name: "Las Condes" }
    ]
  },
  {
    id: "05",
    name: "Región de Valparaíso",
    country: "Chile",
    comunas: [
      { id: "05101", name: "Valparaíso" },
      { id: "05109", name: "Viña del Mar" }
    ]
  }
];

// Exportación principal para compatibilidad
export const chileRegionsCommunes = chilePeruRegionsCommunes;

// También exportamos como default
export default chilePeruRegionsCommunes;

// Función helper para buscar comunas
export const findComunasByRegion = (regionId: string): Comuna[] => {
  const region = chilePeruRegionsCommunes.find((r: Region) => r.id === regionId);
  return region ? region.comunas : [];
};

// Función helper para buscar región por comuna
export const findRegionByComuna = (comunaId: string): Region | undefined => {
  return chilePeruRegionsCommunes.find((region: Region) => 
    region.comunas.some((comuna: Comuna) => comuna.id === comunaId)
  );
};


