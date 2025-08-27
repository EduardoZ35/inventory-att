// Regiones y comunas/provincias de Chile y Perú
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
    id: "CL-15",
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
    id: "CL-01",
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
    id: "CL-02",
    name: "Región de Antofagasta",
    country: "Chile",
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
    id: "CL-03",
    name: "Región de Atacama",
    country: "Chile",
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
    id: "CL-04",
    name: "Región de Coquimbo",
    country: "Chile",
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
    id: "CL-05",
    name: "Región de Valparaíso",
    country: "Chile",
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
    id: "CL-13",
    name: "Región Metropolitana de Santiago",
    country: "Chile",
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

  // === PERÚ ===
  {
    id: "PE-AMA",
    name: "Amazonas",
    country: "Peru",
    comunas: [
      { id: "PE-AMA-01", name: "Chachapoyas" },
      { id: "PE-AMA-02", name: "Bagua" },
      { id: "PE-AMA-03", name: "Bongará" },
      { id: "PE-AMA-04", name: "Condorcanqui" },
      { id: "PE-AMA-05", name: "Luya" },
      { id: "PE-AMA-06", name: "Rodríguez de Mendoza" },
      { id: "PE-AMA-07", name: "Utcubamba" }
    ]
  },
  {
    id: "PE-ANC",
    name: "Áncash",
    country: "Peru",
    comunas: [
      { id: "PE-ANC-01", name: "Huaraz" },
      { id: "PE-ANC-02", name: "Aija" },
      { id: "PE-ANC-03", name: "Antonio Raymondi" },
      { id: "PE-ANC-04", name: "Asunción" },
      { id: "PE-ANC-05", name: "Bolognesi" },
      { id: "PE-ANC-06", name: "Carhuaz" },
      { id: "PE-ANC-07", name: "Carlos Fermín Fitzcarrald" },
      { id: "PE-ANC-08", name: "Casma" },
      { id: "PE-ANC-09", name: "Corongo" },
      { id: "PE-ANC-10", name: "Huari" },
      { id: "PE-ANC-11", name: "Huarmey" },
      { id: "PE-ANC-12", name: "Huaylas" },
      { id: "PE-ANC-13", name: "Mariscal Luzuriaga" },
      { id: "PE-ANC-14", name: "Ocros" },
      { id: "PE-ANC-15", name: "Pallasca" },
      { id: "PE-ANC-16", name: "Pomabamba" },
      { id: "PE-ANC-17", name: "Recuay" },
      { id: "PE-ANC-18", name: "Santa" },
      { id: "PE-ANC-19", name: "Sihuas" },
      { id: "PE-ANC-20", name: "Yungay" }
    ]
  },
  {
    id: "PE-APU",
    name: "Apurímac",
    country: "Peru",
    comunas: [
      { id: "PE-APU-01", name: "Abancay" },
      { id: "PE-APU-02", name: "Andahuaylas" },
      { id: "PE-APU-03", name: "Antabamba" },
      { id: "PE-APU-04", name: "Aymaraes" },
      { id: "PE-APU-05", name: "Cotabambas" },
      { id: "PE-APU-06", name: "Chincheros" },
      { id: "PE-APU-07", name: "Grau" }
    ]
  },
  {
    id: "PE-ARE",
    name: "Arequipa",
    country: "Peru",
    comunas: [
      { id: "PE-ARE-01", name: "Arequipa" },
      { id: "PE-ARE-02", name: "Camaná" },
      { id: "PE-ARE-03", name: "Caravelí" },
      { id: "PE-ARE-04", name: "Castilla" },
      { id: "PE-ARE-05", name: "Caylloma" },
      { id: "PE-ARE-06", name: "Condesuyos" },
      { id: "PE-ARE-07", name: "Islay" },
      { id: "PE-ARE-08", name: "La Unión" }
    ]
  },
  {
    id: "PE-AYA",
    name: "Ayacucho",
    country: "Peru",
    comunas: [
      { id: "PE-AYA-01", name: "Huamanga" },
      { id: "PE-AYA-02", name: "Cangallo" },
      { id: "PE-AYA-03", name: "Huanca Sancos" },
      { id: "PE-AYA-04", name: "Huanta" },
      { id: "PE-AYA-05", name: "La Mar" },
      { id: "PE-AYA-06", name: "Lucanas" },
      { id: "PE-AYA-07", name: "Parinacochas" },
      { id: "PE-AYA-08", name: "Páucar del Sara Sara" },
      { id: "PE-AYA-09", name: "Sucre" },
      { id: "PE-AYA-10", name: "Víctor Fajardo" },
      { id: "PE-AYA-11", name: "Vilcas Huamán" }
    ]
  },
  {
    id: "PE-CAJ",
    name: "Cajamarca",
    country: "Peru",
    comunas: [
      { id: "PE-CAJ-01", name: "Cajamarca" },
      { id: "PE-CAJ-02", name: "Cajabamba" },
      { id: "PE-CAJ-03", name: "Celendín" },
      { id: "PE-CAJ-04", name: "Chota" },
      { id: "PE-CAJ-05", name: "Contumazá" },
      { id: "PE-CAJ-06", name: "Cutervo" },
      { id: "PE-CAJ-07", name: "Hualgayoc" },
      { id: "PE-CAJ-08", name: "Jaén" },
      { id: "PE-CAJ-09", name: "San Ignacio" },
      { id: "PE-CAJ-10", name: "San Marcos" },
      { id: "PE-CAJ-11", name: "San Miguel" },
      { id: "PE-CAJ-12", name: "San Pablo" },
      { id: "PE-CAJ-13", name: "Santa Cruz" }
    ]
  },
  {
    id: "PE-CAL",
    name: "Callao",
    country: "Peru",
    comunas: [
      { id: "PE-CAL-01", name: "Callao" },
      { id: "PE-CAL-02", name: "Bellavista" },
      { id: "PE-CAL-03", name: "Carmen de la Legua Reynoso" },
      { id: "PE-CAL-04", name: "La Perla" },
      { id: "PE-CAL-05", name: "La Punta" },
      { id: "PE-CAL-06", name: "Mi Perú" },
      { id: "PE-CAL-07", name: "Ventanilla" }
    ]
  },
  {
    id: "PE-CUS",
    name: "Cusco",
    country: "Peru",
    comunas: [
      { id: "PE-CUS-01", name: "Cusco" },
      { id: "PE-CUS-02", name: "Acomayo" },
      { id: "PE-CUS-03", name: "Anta" },
      { id: "PE-CUS-04", name: "Calca" },
      { id: "PE-CUS-05", name: "Canas" },
      { id: "PE-CUS-06", name: "Canchis" },
      { id: "PE-CUS-07", name: "Chumbivilcas" },
      { id: "PE-CUS-08", name: "Espinar" },
      { id: "PE-CUS-09", name: "La Convención" },
      { id: "PE-CUS-10", name: "Paruro" },
      { id: "PE-CUS-11", name: "Paucartambo" },
      { id: "PE-CUS-12", name: "Quispicanchi" },
      { id: "PE-CUS-13", name: "Urubamba" }
    ]
  },
  {
    id: "PE-HUV",
    name: "Huancavelica",
    country: "Peru",
    comunas: [
      { id: "PE-HUV-01", name: "Huancavelica" },
      { id: "PE-HUV-02", name: "Acobamba" },
      { id: "PE-HUV-03", name: "Angaraes" },
      { id: "PE-HUV-04", name: "Castrovirreyna" },
      { id: "PE-HUV-05", name: "Churcampa" },
      { id: "PE-HUV-06", name: "Huaytará" },
      { id: "PE-HUV-07", name: "Tayacaja" }
    ]
  },
  {
    id: "PE-HUC",
    name: "Huánuco",
    country: "Peru",
    comunas: [
      { id: "PE-HUC-01", name: "Huánuco" },
      { id: "PE-HUC-02", name: "Ambo" },
      { id: "PE-HUC-03", name: "Dos de Mayo" },
      { id: "PE-HUC-04", name: "Huacaybamba" },
      { id: "PE-HUC-05", name: "Huamalíes" },
      { id: "PE-HUC-06", name: "Leoncio Prado" },
      { id: "PE-HUC-07", name: "Marañón" },
      { id: "PE-HUC-08", name: "Pachitea" },
      { id: "PE-HUC-09", name: "Puerto Inca" },
      { id: "PE-HUC-10", name: "Lauricocha" },
      { id: "PE-HUC-11", name: "Yarowilca" }
    ]
  },
  {
    id: "PE-ICA",
    name: "Ica",
    country: "Peru",
    comunas: [
      { id: "PE-ICA-01", name: "Ica" },
      { id: "PE-ICA-02", name: "Chincha" },
      { id: "PE-ICA-03", name: "Nazca" },
      { id: "PE-ICA-04", name: "Palpa" },
      { id: "PE-ICA-05", name: "Pisco" }
    ]
  },
  {
    id: "PE-JUN",
    name: "Junín",
    country: "Peru",
    comunas: [
      { id: "PE-JUN-01", name: "Huancayo" },
      { id: "PE-JUN-02", name: "Concepción" },
      { id: "PE-JUN-03", name: "Chanchamayo" },
      { id: "PE-JUN-04", name: "Jauja" },
      { id: "PE-JUN-05", name: "Junín" },
      { id: "PE-JUN-06", name: "Satipo" },
      { id: "PE-JUN-07", name: "Tarma" },
      { id: "PE-JUN-08", name: "Yauli" },
      { id: "PE-JUN-09", name: "Chupaca" }
    ]
  },
  {
    id: "PE-LAL",
    name: "La Libertad",
    country: "Peru",
    comunas: [
      { id: "PE-LAL-01", name: "Trujillo" },
      { id: "PE-LAL-02", name: "Ascope" },
      { id: "PE-LAL-03", name: "Bolívar" },
      { id: "PE-LAL-04", name: "Chepén" },
      { id: "PE-LAL-05", name: "Julcán" },
      { id: "PE-LAL-06", name: "Otuzco" },
      { id: "PE-LAL-07", name: "Pacasmayo" },
      { id: "PE-LAL-08", name: "Pataz" },
      { id: "PE-LAL-09", name: "Sánchez Carrión" },
      { id: "PE-LAL-10", name: "Santiago de Chuco" },
      { id: "PE-LAL-11", name: "Gran Chimú" },
      { id: "PE-LAL-12", name: "Virú" }
    ]
  },
  {
    id: "PE-LAM",
    name: "Lambayeque",
    country: "Peru",
    comunas: [
      { id: "PE-LAM-01", name: "Chiclayo" },
      { id: "PE-LAM-02", name: "Ferreñafe" },
      { id: "PE-LAM-03", name: "Lambayeque" }
    ]
  },
  {
    id: "PE-LIM",
    name: "Lima",
    country: "Peru",
    comunas: [
      { id: "PE-LIM-01", name: "Lima" },
      { id: "PE-LIM-02", name: "Barranca" },
      { id: "PE-LIM-03", name: "Cajatambo" },
      { id: "PE-LIM-04", name: "Canta" },
      { id: "PE-LIM-05", name: "Cañete" },
      { id: "PE-LIM-06", name: "Huaral" },
      { id: "PE-LIM-07", name: "Huarochirí" },
      { id: "PE-LIM-08", name: "Huaura" },
      { id: "PE-LIM-09", name: "Oyón" },
      { id: "PE-LIM-10", name: "Yauyos" }
    ]
  },
  {
    id: "PE-LOR",
    name: "Loreto",
    country: "Peru",
    comunas: [
      { id: "PE-LOR-01", name: "Maynas" },
      { id: "PE-LOR-02", name: "Alto Amazonas" },
      { id: "PE-LOR-03", name: "Loreto" },
      { id: "PE-LOR-04", name: "Mariscal Ramón Castilla" },
      { id: "PE-LOR-05", name: "Requena" },
      { id: "PE-LOR-06", name: "Ucayali" },
      { id: "PE-LOR-07", name: "Datem del Marañón" },
      { id: "PE-LOR-08", name: "Putumayo" }
    ]
  },
  {
    id: "PE-MDD",
    name: "Madre de Dios",
    country: "Peru",
    comunas: [
      { id: "PE-MDD-01", name: "Tambopata" },
      { id: "PE-MDD-02", name: "Manu" },
      { id: "PE-MDD-03", name: "Tahuamanu" }
    ]
  },
  {
    id: "PE-MOQ",
    name: "Moquegua",
    country: "Peru",
    comunas: [
      { id: "PE-MOQ-01", name: "Mariscal Nieto" },
      { id: "PE-MOQ-02", name: "General Sánchez Cerro" },
      { id: "PE-MOQ-03", name: "Ilo" }
    ]
  },
  {
    id: "PE-PAS",
    name: "Pasco",
    country: "Peru",
    comunas: [
      { id: "PE-PAS-01", name: "Pasco" },
      { id: "PE-PAS-02", name: "Daniel Alcides Carrión" },
      { id: "PE-PAS-03", name: "Oxapampa" }
    ]
  },
  {
    id: "PE-PIU",
    name: "Piura",
    country: "Peru",
    comunas: [
      { id: "PE-PIU-01", name: "Piura" },
      { id: "PE-PIU-02", name: "Ayabaca" },
      { id: "PE-PIU-03", name: "Huancabamba" },
      { id: "PE-PIU-04", name: "Morropón" },
      { id: "PE-PIU-05", name: "Paita" },
      { id: "PE-PIU-06", name: "Sullana" },
      { id: "PE-PIU-07", name: "Talara" },
      { id: "PE-PIU-08", name: "Sechura" }
    ]
  },
  {
    id: "PE-PUN",
    name: "Puno",
    country: "Peru",
    comunas: [
      { id: "PE-PUN-01", name: "Puno" },
      { id: "PE-PUN-02", name: "Azángaro" },
      { id: "PE-PUN-03", name: "Carabaya" },
      { id: "PE-PUN-04", name: "Chucuito" },
      { id: "PE-PUN-05", name: "El Collao" },
      { id: "PE-PUN-06", name: "Huancané" },
      { id: "PE-PUN-07", name: "Lampa" },
      { id: "PE-PUN-08", name: "Melgar" },
      { id: "PE-PUN-09", name: "Moho" },
      { id: "PE-PUN-10", name: "San Antonio de Putina" },
      { id: "PE-PUN-11", name: "San Román" },
      { id: "PE-PUN-12", name: "Sandia" },
      { id: "PE-PUN-13", name: "Yunguyo" }
    ]
  },
  {
    id: "PE-SAM",
    name: "San Martín",
    country: "Peru",
    comunas: [
      { id: "PE-SAM-01", name: "Moyobamba" },
      { id: "PE-SAM-02", name: "Bellavista" },
      { id: "PE-SAM-03", name: "El Dorado" },
      { id: "PE-SAM-04", name: "Huallaga" },
      { id: "PE-SAM-05", name: "Lamas" },
      { id: "PE-SAM-06", name: "Mariscal Cáceres" },
      { id: "PE-SAM-07", name: "Picota" },
      { id: "PE-SAM-08", name: "Rioja" },
      { id: "PE-SAM-09", name: "San Martín" },
      { id: "PE-SAM-10", name: "Tocache" }
    ]
  },
  {
    id: "PE-TAC",
    name: "Tacna",
    country: "Peru",
    comunas: [
      { id: "PE-TAC-01", name: "Tacna" },
      { id: "PE-TAC-02", name: "Candarave" },
      { id: "PE-TAC-03", name: "Jorge Basadre" },
      { id: "PE-TAC-04", name: "Tarata" }
    ]
  },
  {
    id: "PE-TUM",
    name: "Tumbes",
    country: "Peru",
    comunas: [
      { id: "PE-TUM-01", name: "Tumbes" },
      { id: "PE-TUM-02", name: "Contralmirante Villar" },
      { id: "PE-TUM-03", name: "Zarumilla" }
    ]
  },
  {
    id: "PE-UCA",
    name: "Ucayali",
    country: "Peru",
    comunas: [
      { id: "PE-UCA-01", name: "Coronel Portillo" },
      { id: "PE-UCA-02", name: "Atalaya" },
      { id: "PE-UCA-03", name: "Padre Abad" },
      { id: "PE-UCA-04", name: "Purús" }
    ]
  }
];

// Función helper para buscar comunas por región
export const findComunasByRegion = (regionId: string): Comuna[] => {
  const region = chilePeruRegionsCommunes.find(r => r.id === regionId);
  return region ? region.comunas : [];
};

// Función helper para buscar región por comuna
export const findRegionByComuna = (comunaId: string): Region | undefined => {
  return chilePeruRegionsCommunes.find(region => 
    region.comunas.some(comuna => comuna.id === comunaId)
  );
};

// Función helper para filtrar por país
export const getRegionsByCountry = (country: 'Chile' | 'Peru'): Region[] => {
  return chilePeruRegionsCommunes.filter(region => region.country === country);
};


