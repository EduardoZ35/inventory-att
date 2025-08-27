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
  // === CHILE ===
  {
    id: "15",
    name: "Región de Arica y Parinacota",
    country: "Chile",
    comunas: [
      { id: "15101", name: "Arica" },
      { id: "15102", name: "Camarones" },
      { id: "15201", name: "Putre" },
      { id: "15202", name: "General Lagos" }
    ]
  },
  {
    id: "01",
    name: "Región de Tarapacá",
    country: "Chile",
    comunas: [
      { id: "01101", name: "Iquique" },
      { id: "01107", name: "Alto Hospicio" },
      { id: "01401", name: "Pozo Almonte" },
      { id: "01402", name: "Camiña" },
      { id: "01403", name: "Colchane" },
      { id: "01404", name: "Huara" },
      { id: "01405", name: "Pica" }
    ]
  },
  {
    id: "02",
    name: "Región de Antofagasta",
    comunas: [
      { id: "02101", name: "Antofagasta" },
      { id: "02102", name: "Mejillones" },
      { id: "02103", name: "Sierra Gorda" },
      { id: "02104", name: "Taltal" },
      { id: "02201", name: "Calama" },
      { id: "02202", name: "Ollagüe" },
      { id: "02203", name: "San Pedro de Atacama" },
      { id: "02301", name: "Tocopilla" },
      { id: "02302", name: "María Elena" }
    ]
  },
  {
    id: "03",
    name: "Región de Atacama",
    comunas: [
      { id: "03101", name: "Copiapó" },
      { id: "03102", name: "Caldera" },
      { id: "03103", name: "Tierra Amarilla" },
      { id: "03201", name: "Chañaral" },
      { id: "03202", name: "Diego de Almagro" },
      { id: "03301", name: "Vallenar" },
      { id: "03302", name: "Alto del Carmen" },
      { id: "03303", name: "Freirina" },
      { id: "03304", name: "Huasco" }
    ]
  },
  {
    id: "04",
    name: "Región de Coquimbo",
    comunas: [
      { id: "04101", name: "La Serena" },
      { id: "04102", name: "Coquimbo" },
      { id: "04103", name: "Andacollo" },
      { id: "04104", name: "La Higuera" },
      { id: "04105", name: "Paiguano" },
      { id: "04106", name: "Vicuña" },
      { id: "04201", name: "Illapel" },
      { id: "04202", name: "Canela" },
      { id: "04203", name: "Los Vilos" },
      { id: "04204", name: "Salamanca" },
      { id: "04301", name: "Ovalle" },
      { id: "04302", name: "Combarbalá" },
      { id: "04303", name: "Monte Patria" },
      { id: "04304", name: "Punitaqui" },
      { id: "04305", name: "Río Hurtado" }
    ]
  },
  {
    id: "05",
    name: "Región de Valparaíso",
    comunas: [
      { id: "05101", name: "Valparaíso" },
      { id: "05102", name: "Casablanca" },
      { id: "05103", name: "Concón" },
      { id: "05104", name: "Juan Fernández" },
      { id: "05105", name: "Puchuncaví" },
      { id: "05107", name: "Quintero" },
      { id: "05109", name: "Viña del Mar" },
      { id: "05201", name: "Isla de Pascua" },
      { id: "05301", name: "Los Andes" },
      { id: "05302", name: "Calle Larga" },
      { id: "05303", name: "Rinconada" },
      { id: "05304", name: "San Esteban" },
      { id: "05401", name: "La Ligua" },
      { id: "05402", name: "Cabildo" },
      { id: "05403", name: "Papudo" },
      { id: "05404", name: "Petorca" },
      { id: "05405", name: "Zapallar" },
      { id: "05501", name: "Quillota" },
      { id: "05502", name: "Calera" },
      { id: "05503", name: "Hijuelas" },
      { id: "05504", name: "La Cruz" },
      { id: "05506", name: "Nogales" },
      { id: "05601", name: "San Antonio" },
      { id: "05602", name: "Algarrobo" },
      { id: "05603", name: "Cartagena" },
      { id: "05604", name: "El Quisco" },
      { id: "05605", name: "El Tabo" },
      { id: "05606", name: "Santo Domingo" },
      { id: "05701", name: "San Felipe" },
      { id: "05702", name: "Catemu" },
      { id: "05703", name: "Llaillay" },
      { id: "05704", name: "Panquehue" },
      { id: "05705", name: "Putaendo" },
      { id: "05706", name: "Santa María" }
    ]
  },
  {
    id: "13",
    name: "Región Metropolitana de Santiago",
    comunas: [
      { id: "13101", name: "Santiago" },
      { id: "13102", name: "Cerrillos" },
      { id: "13103", name: "Cerro Navia" },
      { id: "13104", name: "Conchalí" },
      { id: "13105", name: "El Bosque" },
      { id: "13106", name: "Estación Central" },
      { id: "13107", name: "Huechuraba" },
      { id: "13108", name: "Independencia" },
      { id: "13109", name: "La Cisterna" },
      { id: "13110", name: "La Florida" },
      { id: "13111", name: "La Granja" },
      { id: "13112", name: "La Pintana" },
      { id: "13113", name: "La Reina" },
      { id: "13114", name: "Las Condes" },
      { id: "13115", name: "Lo Barnechea" },
      { id: "13116", name: "Lo Espejo" },
      { id: "13117", name: "Lo Prado" },
      { id: "13118", name: "Macul" },
      { id: "13119", name: "Maipú" },
      { id: "13120", name: "Ñuñoa" },
      { id: "13121", name: "Pedro Aguirre Cerda" },
      { id: "13122", name: "Peñalolén" },
      { id: "13123", name: "Providencia" },
      { id: "13124", name: "Pudahuel" },
      { id: "13125", name: "Quilicura" },
      { id: "13126", name: "Quinta Normal" },
      { id: "13127", name: "Recoleta" },
      { id: "13128", name: "Renca" },
      { id: "13129", name: "San Joaquín" },
      { id: "13130", name: "San Miguel" },
      { id: "13131", name: "San Ramón" },
      { id: "13132", name: "Vitacura" },
      { id: "13201", name: "Puente Alto" },
      { id: "13202", name: "Pirque" },
      { id: "13203", name: "San José de Maipo" },
      { id: "13301", name: "Colina" },
      { id: "13302", name: "Lampa" },
      { id: "13303", name: "Tiltil" },
      { id: "13401", name: "San Bernardo" },
      { id: "13402", name: "Buin" },
      { id: "13403", name: "Calera de Tango" },
      { id: "13404", name: "Paine" },
      { id: "13501", name: "Melipilla" },
      { id: "13502", name: "Alhué" },
      { id: "13503", name: "Curacaví" },
      { id: "13504", name: "María Pinto" },
      { id: "13505", name: "San Pedro" },
      { id: "13601", name: "Talagante" },
      { id: "13602", name: "El Monte" },
      { id: "13603", name: "Isla de Maipo" },
      { id: "13604", name: "Padre Hurtado" },
      { id: "13605", name: "Peñaflor" }
    ]
  },
  {
    id: "06",
    name: "Región del Libertador General Bernardo O'Higgins",
    comunas: [
      { id: "06101", name: "Rancagua" },
      { id: "06102", name: "Codegua" },
      { id: "06103", name: "Coinco" },
      { id: "06104", name: "Coltauco" },
      { id: "06105", name: "Doñihue" },
      { id: "06106", name: "Graneros" },
      { id: "06107", name: "Las Cabras" },
      { id: "06108", name: "Machalí" },
      { id: "06109", name: "Malloa" },
      { id: "06110", name: "Mostazal" },
      { id: "06111", name: "Olivar" },
      { id: "06112", name: "Peumo" },
      { id: "06113", name: "Pichidegua" },
      { id: "06114", name: "Quinta de Tilcoco" },
      { id: "06115", name: "Rengo" },
      { id: "06116", name: "Requínoa" },
      { id: "06117", name: "San Vicente" },
      { id: "06201", name: "Pichilemu" },
      { id: "06202", name: "La Estrella" },
      { id: "06203", name: "Litueche" },
      { id: "06204", name: "Marchihue" },
      { id: "06205", name: "Navidad" },
      { id: "06206", name: "Paredones" },
      { id: "06301", name: "San Fernando" },
      { id: "06302", name: "Chépica" },
      { id: "06303", name: "Chimbarongo" },
      { id: "06304", name: "Lolol" },
      { id: "06305", name: "Nancagua" },
      { id: "06306", name: "Palmilla" },
      { id: "06307", name: "Peralillo" },
      { id: "06308", name: "Placilla" },
      { id: "06309", name: "Pumanque" },
      { id: "06310", name: "Santa Cruz" }
    ]
  },
  {
    id: "07",
    name: "Región del Maule",
    comunas: [
      { id: "07101", name: "Talca" },
      { id: "07102", name: "Constitución" },
      { id: "07103", name: "Curepto" },
      { id: "07104", name: "Empedrado" },
      { id: "07105", name: "Maule" },
      { id: "07106", name: "Pelarco" },
      { id: "07107", name: "Pencahue" },
      { id: "07108", name: "Río Claro" },
      { id: "07109", name: "San Clemente" },
      { id: "07110", name: "San Rafael" },
      { id: "07201", name: "Cauquenes" },
      { id: "07202", name: "Chanco" },
      { id: "07203", name: "Pelluhue" },
      { id: "07301", name: "Curicó" },
      { id: "07302", name: "Hualañé" },
      { id: "07303", name: "Licantén" },
      { id: "07304", name: "Molina" },
      { id: "07305", name: "Rauco" },
      { id: "07306", name: "Romeral" },
      { id: "07307", name: "Sagrada Familia" },
      { id: "07308", name: "Teno" },
      { id: "07309", name: "Vichuquén" },
      { id: "07401", name: "Linares" },
      { id: "07402", name: "Colbún" },
      { id: "07403", name: "Longaví" },
      { id: "07404", name: "Parral" },
      { id: "07405", name: "Retiro" },
      { id: "07406", name: "San Javier" },
      { id: "07407", name: "Villa Alegre" },
      { id: "07408", name: "Yerbas Buenas" }
    ]
  },
  {
    id: "16",
    name: "Región de Ñuble",
    comunas: [
      { id: "16101", name: "Chillán" },
      { id: "16102", name: "Bulnes" },
      { id: "16103", name: "Cobquecura" },
      { id: "16104", name: "Coelemu" },
      { id: "16105", name: "Coihueco" },
      { id: "16106", name: "Chillán Viejo" },
      { id: "16107", name: "El Carmen" },
      { id: "16108", name: "Ninhue" },
      { id: "16109", name: "Ñiquén" },
      { id: "16110", name: "Pemuco" },
      { id: "16111", name: "Pinto" },
      { id: "16112", name: "Portezuelo" },
      { id: "16113", name: "Quillón" },
      { id: "16114", name: "Quirihue" },
      { id: "16115", name: "Ránquil" },
      { id: "16116", name: "San Carlos" },
      { id: "16117", name: "San Fabián" },
      { id: "16118", name: "San Ignacio" },
      { id: "16119", name: "San Nicolás" },
      { id: "16120", name: "Treguaco" },
      { id: "16121", name: "Yungay" }
    ]
  },
  {
    id: "08",
    name: "Región del Biobío",
    comunas: [
      { id: "08101", name: "Concepción" },
      { id: "08102", name: "Coronel" },
      { id: "08103", name: "Chiguayante" },
      { id: "08104", name: "Florida" },
      { id: "08105", name: "Hualqui" },
      { id: "08106", name: "Lota" },
      { id: "08107", name: "Penco" },
      { id: "08108", name: "San Pedro de la Paz" },
      { id: "08109", name: "Santa Juana" },
      { id: "08110", name: "Talcahuano" },
      { id: "08111", name: "Tomé" },
      { id: "08112", name: "Hualpén" },
      { id: "08201", name: "Lebu" },
      { id: "08202", name: "Arauco" },
      { id: "08203", name: "Cañete" },
      { id: "08204", name: "Contulmo" },
      { id: "08205", name: "Curanilahue" },
      { id: "08206", name: "Los Álamos" },
      { id: "08207", name: "Tirúa" },
      { id: "08301", name: "Los Ángeles" },
      { id: "08302", name: "Antuco" },
      { id: "08303", name: "Cabrero" },
      { id: "08304", name: "Laja" },
      { id: "08305", name: "Mulchén" },
      { id: "08306", name: "Nacimiento" },
      { id: "08307", name: "Negrete" },
      { id: "08308", name: "Quilaco" },
      { id: "08309", name: "Quilleco" },
      { id: "08310", name: "San Rosendo" },
      { id: "08311", name: "Santa Bárbara" },
      { id: "08312", name: "Tucapel" },
      { id: "08313", name: "Yumbel" },
      { id: "08314", name: "Alto Biobío" }
    ]
  },
  {
    id: "09",
    name: "Región de La Araucanía",
    comunas: [
      { id: "09101", name: "Temuco" },
      { id: "09102", name: "Carahue" },
      { id: "09103", name: "Cunco" },
      { id: "09104", name: "Curarrehue" },
      { id: "09105", name: "Freire" },
      { id: "09106", name: "Galvarino" },
      { id: "09107", name: "Gorbea" },
      { id: "09108", name: "Lautaro" },
      { id: "09109", name: "Loncoche" },
      { id: "09110", name: "Melipeuco" },
      { id: "09111", name: "Nueva Imperial" },
      { id: "09112", name: "Padre Las Casas" },
      { id: "09113", name: "Perquenco" },
      { id: "09114", name: "Pitrufquén" },
      { id: "09115", name: "Pucón" },
      { id: "09116", name: "Saavedra" },
      { id: "09117", name: "Teodoro Schmidt" },
      { id: "09118", name: "Toltén" },
      { id: "09119", name: "Vilcún" },
      { id: "09120", name: "Villarrica" },
      { id: "09121", name: "Cholchol" },
      { id: "09201", name: "Angol" },
      { id: "09202", name: "Collipulli" },
      { id: "09203", name: "Curacautín" },
      { id: "09204", name: "Ercilla" },
      { id: "09205", name: "Lonquimay" },
      { id: "09206", name: "Los Sauces" },
      { id: "09207", name: "Lumaco" },
      { id: "09208", name: "Purén" },
      { id: "09209", name: "Renaico" },
      { id: "09210", name: "Traiguén" },
      { id: "09211", name: "Victoria" }
    ]
  },
  {
    id: "14",
    name: "Región de Los Ríos",
    comunas: [
      { id: "14101", name: "Valdivia" },
      { id: "14102", name: "Corral" },
      { id: "14103", name: "Lanco" },
      { id: "14104", name: "Los Lagos" },
      { id: "14105", name: "Máfil" },
      { id: "14106", name: "Mariquina" },
      { id: "14107", name: "Paillaco" },
      { id: "14108", name: "Panguipulli" },
      { id: "14201", name: "La Unión" },
      { id: "14202", name: "Futrono" },
      { id: "14203", name: "Lago Ranco" },
      { id: "14204", name: "Río Bueno" }
    ]
  },
  {
    id: "10",
    name: "Región de Los Lagos",
    comunas: [
      { id: "10101", name: "Puerto Montt" },
      { id: "10102", name: "Calbuco" },
      { id: "10103", name: "Cochamó" },
      { id: "10104", name: "Fresia" },
      { id: "10105", name: "Frutillar" },
      { id: "10106", name: "Los Muermos" },
      { id: "10107", name: "Llanquihue" },
      { id: "10108", name: "Maullín" },
      { id: "10109", name: "Puerto Varas" },
      { id: "10201", name: "Castro" },
      { id: "10202", name: "Ancud" },
      { id: "10203", name: "Chonchi" },
      { id: "10204", name: "Curaco de Vélez" },
      { id: "10205", name: "Dalcahue" },
      { id: "10206", name: "Puqueldón" },
      { id: "10207", name: "Queilén" },
      { id: "10208", name: "Quellón" },
      { id: "10209", name: "Quemchi" },
      { id: "10210", name: "Quinchao" },
      { id: "10301", name: "Osorno" },
      { id: "10302", name: "Puerto Octay" },
      { id: "10303", name: "Purranque" },
      { id: "10304", name: "Puyehue" },
      { id: "10305", name: "Río Negro" },
      { id: "10306", name: "San Juan de la Costa" },
      { id: "10307", name: "San Pablo" },
      { id: "10401", name: "Chaitén" },
      { id: "10402", name: "Futaleufú" },
      { id: "10403", name: "Hualaihué" },
      { id: "10404", name: "Palena" }
    ]
  },
  {
    id: "11",
    name: "Región Aysén del General Carlos Ibáñez del Campo",
    comunas: [
      { id: "11101", name: "Coyhaique" },
      { id: "11102", name: "Lago Verde" },
      { id: "11201", name: "Aysén" },
      { id: "11202", name: "Cisnes" },
      { id: "11203", name: "Guaitecas" },
      { id: "11301", name: "Cochrane" },
      { id: "11302", name: "O'Higgins" },
      { id: "11303", name: "Tortel" },
      { id: "11401", name: "Chile Chico" },
      { id: "11402", name: "Río Ibáñez" }
    ]
  },
  {
    id: "12",
    name: "Región de Magallanes y de la Antártica Chilena",
    comunas: [
      { id: "12101", name: "Punta Arenas" },
      { id: "12102", name: "Laguna Blanca" },
      { id: "12103", name: "Río Verde" },
      { id: "12104", name: "San Gregorio" },
      { id: "12201", name: "Cabo de Hornos (Ex Navarino)" },
      { id: "12202", name: "Antártica" },
      { id: "12301", name: "Porvenir" },
      { id: "12302", name: "Primavera" },
      { id: "12401", name: "Natales" },
      { id: "12402", name: "Torres del Paine" }
    ]
  }
];

// Función helper para buscar comunas
export const findComunasByRegion = (regionId: string): Comuna[] => {
  const region = chileRegionsCommunes.find(r => r.id === regionId);
  return region ? region.comunas : [];
};

// Función helper para buscar región por comuna
export const findRegionByComuna = (comunaId: string): Region | undefined => {
  return chileRegionsCommunes.find(region => 
    region.comunas.some(comuna => comuna.id === comunaId)
  );
};
