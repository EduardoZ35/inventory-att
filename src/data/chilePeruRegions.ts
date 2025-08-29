// Regiones, provincias y comunas/distritos de Chile y Perú
export interface Comuna {
  id: string;
  name: string;
}

export interface Provincia {
  id: string;
  name: string;
  comunas: Comuna[];
}

export interface Region {
  id: string;
  name: string;
  provincias: Provincia[];
  country: 'Chile' | 'Peru';
}

export const chilePeruRegionsCommunes: Region[] = [
  // === CHILE ===
  {
    id: "CL-15",
    name: "Región de Arica y Parinacota",
    country: "Chile",
    provincias: [
      {
        id: "CL-15-01",
        name: "Arica",
        comunas: [
          { id: "15101", name: "Arica" },
          { id: "15102", name: "Camarones" }
        ]
      },
      {
        id: "CL-15-02", 
        name: "Parinacota",
        comunas: [
          { id: "15201", name: "Putre" },
          { id: "15202", name: "General Lagos" }
        ]
      }
    ]
  },
  {
    id: "CL-01",
    name: "Región de Tarapacá",
    country: "Chile",
    provincias: [
      {
        id: "CL-01-01",
        name: "Iquique",
        comunas: [
          { id: "01101", name: "Iquique" },
          { id: "01107", name: "Alto Hospicio" }
        ]
      },
      {
        id: "CL-01-02",
        name: "Tamarugal",
        comunas: [
          { id: "01401", name: "Pozo Almonte" },
          { id: "01402", name: "Camiña" },
          { id: "01403", name: "Colchane" },
          { id: "01404", name: "Huara" },
          { id: "01405", name: "Pica" }
        ]
      }
    ]
  },
  {
    id: "CL-02",
    name: "Región de Antofagasta",
    country: "Chile",
    provincias: [
      {
        id: "CL-02-01",
        name: "Antofagasta",
        comunas: [
          { id: "02101", name: "Antofagasta" },
          { id: "02102", name: "Mejillones" },
          { id: "02103", name: "Sierra Gorda" },
          { id: "02104", name: "Taltal" }
        ]
      },
      {
        id: "CL-02-02",
        name: "El Loa",
        comunas: [
          { id: "02201", name: "Calama" },
          { id: "02202", name: "Ollagüe" },
          { id: "02203", name: "San Pedro de Atacama" }
        ]
      },
      {
        id: "CL-02-03",
        name: "Tocopilla",
        comunas: [
          { id: "02301", name: "Tocopilla" },
          { id: "02302", name: "María Elena" }
        ]
      }
    ]
  },
  {
    id: "CL-03",
    name: "Región de Atacama",
    country: "Chile",
    provincias: [
      {
        id: "CL-03-01",
        name: "Copiapó",
        comunas: [
          { id: "03101", name: "Copiapó" },
          { id: "03102", name: "Caldera" },
          { id: "03103", name: "Tierra Amarilla" }
        ]
      },
      {
        id: "CL-03-02",
        name: "Chañaral",
        comunas: [
          { id: "03201", name: "Chañaral" },
          { id: "03202", name: "Diego de Almagro" }
        ]
      },
      {
        id: "CL-03-03",
        name: "Huasco",
        comunas: [
          { id: "03301", name: "Vallenar" },
          { id: "03302", name: "Alto del Carmen" },
          { id: "03303", name: "Freirina" },
          { id: "03304", name: "Huasco" }
        ]
      }
    ]
  },
  {
    id: "CL-04",
    name: "Región de Coquimbo",
    country: "Chile",
    provincias: [
      {
        id: "CL-04-01",
        name: "Elqui",
        comunas: [
          { id: "04101", name: "La Serena" },
          { id: "04102", name: "Coquimbo" },
          { id: "04103", name: "Andacollo" },
          { id: "04104", name: "La Higuera" },
          { id: "04105", name: "Paiguano" },
          { id: "04106", name: "Vicuña" }
        ]
      },
      {
        id: "CL-04-02",
        name: "Choapa",
        comunas: [
          { id: "04201", name: "Illapel" },
          { id: "04202", name: "Canela" },
          { id: "04203", name: "Los Vilos" },
          { id: "04204", name: "Salamanca" }
        ]
      },
      {
        id: "CL-04-03",
        name: "Limarí",
        comunas: [
          { id: "04301", name: "Ovalle" },
          { id: "04302", name: "Combarbalá" },
          { id: "04303", name: "Monte Patria" },
          { id: "04304", name: "Punitaqui" },
          { id: "04305", name: "Río Hurtado" }
        ]
      }
    ]
  },
  {
    id: "CL-05",
    name: "Región de Valparaíso",
    country: "Chile",
    provincias: [
      {
        id: "CL-05-01",
        name: "Valparaíso",
        comunas: [
          { id: "05101", name: "Valparaíso" },
          { id: "05102", name: "Casablanca" },
          { id: "05103", name: "Concón" },
          { id: "05104", name: "Juan Fernández" },
          { id: "05105", name: "Puchuncaví" },
          { id: "05107", name: "Quintero" },
          { id: "05109", name: "Viña del Mar" }
        ]
      },
      {
        id: "CL-05-02",
        name: "Isla de Pascua",
        comunas: [
          { id: "05201", name: "Isla de Pascua" }
        ]
      },
      {
        id: "CL-05-03",
        name: "Los Andes",
        comunas: [
          { id: "05301", name: "Los Andes" },
          { id: "05302", name: "Calle Larga" },
          { id: "05303", name: "Rinconada" },
          { id: "05304", name: "San Esteban" }
        ]
      },
      {
        id: "CL-05-04",
        name: "Petorca",
        comunas: [
          { id: "05401", name: "La Ligua" },
          { id: "05402", name: "Cabildo" },
          { id: "05403", name: "Papudo" },
          { id: "05404", name: "Petorca" },
          { id: "05405", name: "Zapallar" }
        ]
      },
      {
        id: "CL-05-05",
        name: "Quillota",
        comunas: [
          { id: "05501", name: "Quillota" },
          { id: "05502", name: "Calera" },
          { id: "05503", name: "Hijuelas" },
          { id: "05504", name: "La Cruz" },
          { id: "05506", name: "Nogales" }
        ]
      },
      {
        id: "CL-05-06",
        name: "San Antonio",
        comunas: [
          { id: "05601", name: "San Antonio" },
          { id: "05602", name: "Algarrobo" },
          { id: "05603", name: "Cartagena" },
          { id: "05604", name: "El Quisco" },
          { id: "05605", name: "El Tabo" },
          { id: "05606", name: "Santo Domingo" }
        ]
      },
      {
        id: "CL-05-07",
        name: "San Felipe de Aconcagua",
        comunas: [
          { id: "05701", name: "San Felipe" },
          { id: "05702", name: "Catemu" },
          { id: "05703", name: "Llaillay" },
          { id: "05704", name: "Panquehue" },
          { id: "05705", name: "Putaendo" },
          { id: "05706", name: "Santa María" }
        ]
      }
    ]
  },
  {
    id: "CL-13",
    name: "Región Metropolitana de Santiago",
    country: "Chile",
    provincias: [
      {
        id: "CL-13-01",
        name: "Santiago",
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
          { id: "13132", name: "Vitacura" }
        ]
      },
      {
        id: "CL-13-02",
        name: "Cordillera",
        comunas: [
          { id: "13201", name: "Puente Alto" },
          { id: "13202", name: "Pirque" },
          { id: "13203", name: "San José de Maipo" }
        ]
      },
      {
        id: "CL-13-03",
        name: "Chacabuco",
        comunas: [
          { id: "13301", name: "Colina" },
          { id: "13302", name: "Lampa" },
          { id: "13303", name: "Tiltil" }
        ]
      },
      {
        id: "CL-13-04",
        name: "Maipo",
        comunas: [
          { id: "13401", name: "San Bernardo" },
          { id: "13402", name: "Buin" },
          { id: "13403", name: "Calera de Tango" },
          { id: "13404", name: "Paine" }
        ]
      },
      {
        id: "CL-13-05",
        name: "Melipilla",
        comunas: [
          { id: "13501", name: "Melipilla" },
          { id: "13502", name: "Alhué" },
          { id: "13503", name: "Curacaví" },
          { id: "13504", name: "María Pinto" },
          { id: "13505", name: "San Pedro" }
        ]
      },
      {
        id: "CL-13-06",
        name: "Talagante",
        comunas: [
          { id: "13601", name: "Talagante" },
          { id: "13602", name: "El Monte" },
          { id: "13603", name: "Isla de Maipo" },
          { id: "13604", name: "Padre Hurtado" },
          { id: "13605", name: "Peñaflor" }
        ]
      }
    ]
  },
  {
    id: "CL-06",
    name: "Región del Libertador General Bernardo O'Higgins",
    country: "Chile",
    provincias: [
      {
        id: "CL-06-01",
        name: "Cachapoal",
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
          { id: "06117", name: "San Vicente" }
        ]
      },
      {
        id: "CL-06-02",
        name: "Cardenal Caro",
        comunas: [
          { id: "06201", name: "Pichilemu" },
          { id: "06202", name: "La Estrella" },
          { id: "06203", name: "Litueche" },
          { id: "06204", name: "Marchihue" },
          { id: "06205", name: "Navidad" },
          { id: "06206", name: "Paredones" }
        ]
      },
      {
        id: "CL-06-03",
        name: "Colchagua",
        comunas: [
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
      }
    ]
  },
  {
    id: "CL-07",
    name: "Región del Maule",
    country: "Chile",
    provincias: [
      {
        id: "CL-07-01",
        name: "Talca",
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
          { id: "07110", name: "San Rafael" }
        ]
      },
      {
        id: "CL-07-02",
        name: "Cauquenes",
        comunas: [
          { id: "07201", name: "Cauquenes" },
          { id: "07202", name: "Chanco" },
          { id: "07203", name: "Pelluhue" }
        ]
      },
      {
        id: "CL-07-03",
        name: "Curicó",
        comunas: [
          { id: "07301", name: "Curicó" },
          { id: "07302", name: "Hualañé" },
          { id: "07303", name: "Licantén" },
          { id: "07304", name: "Molina" },
          { id: "07305", name: "Rauco" },
          { id: "07306", name: "Romeral" },
          { id: "07307", name: "Sagrada Familia" },
          { id: "07308", name: "Teno" },
          { id: "07309", name: "Vichuquén" }
        ]
      },
      {
        id: "CL-07-04",
        name: "Linares",
        comunas: [
          { id: "07401", name: "Linares" },
          { id: "07402", name: "Colbún" },
          { id: "07403", name: "Longaví" },
          { id: "07404", name: "Parral" },
          { id: "07405", name: "Retiro" },
          { id: "07406", name: "San Javier" },
          { id: "07407", name: "Villa Alegre" },
          { id: "07408", name: "Yerbas Buenas" }
        ]
      }
    ]
  },
  {
    id: "CL-08",
    name: "Región del Biobío",
    country: "Chile",
    provincias: [
      {
        id: "CL-08-01",
        name: "Concepción",
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
          { id: "08112", name: "Hualpén" }
        ]
      },
      {
        id: "CL-08-02",
        name: "Arauco",
        comunas: [
          { id: "08201", name: "Lebu" },
          { id: "08202", name: "Arauco" },
          { id: "08203", name: "Cañete" },
          { id: "08204", name: "Contulmo" },
          { id: "08205", name: "Curanilahue" },
          { id: "08206", name: "Los Álamos" },
          { id: "08207", name: "Tirúa" }
        ]
      },
      {
        id: "CL-08-03",
        name: "Biobío",
        comunas: [
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
        id: "CL-08-04",
        name: "Ñuble",
        comunas: [
          { id: "08401", name: "Chillán" },
          { id: "08402", name: "Bulnes" },
          { id: "08403", name: "Cobquecura" },
          { id: "08404", name: "Coelemu" },
          { id: "08405", name: "Coihueco" },
          { id: "08406", name: "Chillán Viejo" },
          { id: "08407", name: "El Carmen" },
          { id: "08408", name: "Ninhue" },
          { id: "08409", name: "Ñiquén" },
          { id: "08410", name: "Pemuco" },
          { id: "08411", name: "Pinto" },
          { id: "08412", name: "Portezuelo" },
          { id: "08413", name: "Quillón" },
          { id: "08414", name: "Quirihue" },
          { id: "08415", name: "Ránquil" },
          { id: "08416", name: "San Carlos" },
          { id: "08417", name: "San Fabián" },
          { id: "08418", name: "San Ignacio" },
          { id: "08419", name: "San Nicolás" },
          { id: "08420", name: "Treguaco" },
          { id: "08421", name: "Yungay" }
        ]
      }
    ]
  },
  {
    id: "CL-09",
    name: "Región de La Araucanía",
    country: "Chile",
    provincias: [
      {
        id: "CL-09-01",
        name: "Cautín",
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
          { id: "09121", name: "Cholchol" }
        ]
      },
      {
        id: "CL-09-02",
        name: "Malleco",
        comunas: [
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
      }
    ]
  },
  {
    id: "CL-10",
    name: "Región de Los Lagos",
    country: "Chile",
    provincias: [
      {
        id: "CL-10-01",
        name: "Llanquihue",
        comunas: [
          { id: "10101", name: "Puerto Montt" },
          { id: "10102", name: "Calbuco" },
          { id: "10103", name: "Cochamó" },
          { id: "10104", name: "Fresia" },
          { id: "10105", name: "Frutillar" },
          { id: "10106", name: "Los Muermos" },
          { id: "10107", name: "Llanquihue" },
          { id: "10108", name: "Maullín" },
          { id: "10109", name: "Puerto Varas" }
        ]
      },
      {
        id: "CL-10-02",
        name: "Chiloé",
        comunas: [
          { id: "10201", name: "Castro" },
          { id: "10202", name: "Ancud" },
          { id: "10203", name: "Chonchi" },
          { id: "10204", name: "Curaco de Vélez" },
          { id: "10205", name: "Dalcahue" },
          { id: "10206", name: "Puqueldón" },
          { id: "10207", name: "Queilén" },
          { id: "10208", name: "Quellón" },
          { id: "10209", name: "Quemchi" },
          { id: "10210", name: "Quinchao" }
        ]
      },
      {
        id: "CL-10-03",
        name: "Osorno",
        comunas: [
          { id: "10301", name: "Osorno" },
          { id: "10302", name: "Puerto Octay" },
          { id: "10303", name: "Purranque" },
          { id: "10304", name: "Puyehue" },
          { id: "10305", name: "Río Negro" },
          { id: "10306", name: "San Juan de la Costa" },
          { id: "10307", name: "San Pablo" }
        ]
      },
      {
        id: "CL-10-04",
        name: "Palena",
        comunas: [
          { id: "10401", name: "Chaitén" },
          { id: "10402", name: "Futaleufú" },
          { id: "10403", name: "Hualaihué" },
          { id: "10404", name: "Palena" }
        ]
      }
    ]
  },
  {
    id: "CL-11",
    name: "Región de Aysén del General Carlos Ibáñez del Campo",
    country: "Chile",
    provincias: [
      {
        id: "CL-11-01",
        name: "Coyhaique",
        comunas: [
          { id: "11101", name: "Coyhaique" },
          { id: "11102", name: "Lago Verde" }
        ]
      },
      {
        id: "CL-11-02",
        name: "Aysén",
        comunas: [
          { id: "11201", name: "Aysén" },
          { id: "11202", name: "Cisnes" },
          { id: "11203", name: "Guaitecas" }
        ]
      },
      {
        id: "CL-11-03",
        name: "Capitán Prat",
        comunas: [
          { id: "11301", name: "Cochrane" },
          { id: "11302", name: "O'Higgins" },
          { id: "11303", name: "Tortel" }
        ]
      },
      {
        id: "CL-11-04",
        name: "General Carrera",
        comunas: [
          { id: "11401", name: "Chile Chico" },
          { id: "11402", name: "Río Ibáñez" }
        ]
      }
    ]
  },
  {
    id: "CL-12",
    name: "Región de Magallanes y de la Antártica Chilena",
    country: "Chile",
    provincias: [
      {
        id: "CL-12-01",
        name: "Magallanes",
        comunas: [
          { id: "12101", name: "Punta Arenas" },
          { id: "12102", name: "Laguna Blanca" },
          { id: "12103", name: "Río Verde" },
          { id: "12104", name: "San Gregorio" }
        ]
      },
      {
        id: "CL-12-02",
        name: "Antártica Chilena",
        comunas: [
          { id: "12201", name: "Cabo de Hornos" },
          { id: "12202", name: "Antártica" }
        ]
      },
      {
        id: "CL-12-03",
        name: "Tierra del Fuego",
        comunas: [
          { id: "12301", name: "Porvenir" },
          { id: "12302", name: "Primavera" },
          { id: "12303", name: "Timaukel" }
        ]
      },
      {
        id: "CL-12-04",
        name: "Última Esperanza",
        comunas: [
          { id: "12401", name: "Natales" },
          { id: "12402", name: "Torres del Paine" }
        ]
      }
    ]
  },
  {
    id: "CL-14",
    name: "Región de Los Ríos",
    country: "Chile",
    provincias: [
      {
        id: "CL-14-01",
        name: "Valdivia",
        comunas: [
          { id: "14101", name: "Valdivia" },
          { id: "14102", name: "Corral" },
          { id: "14103", name: "Lanco" },
          { id: "14104", name: "Los Lagos" },
          { id: "14105", name: "Máfil" },
          { id: "14106", name: "Mariquina" },
          { id: "14107", name: "Paillaco" },
          { id: "14108", name: "Panguipulli" },
          { id: "14109", name: "La Unión" },
          { id: "14110", name: "Futrono" },
          { id: "14111", name: "Lago Ranco" },
          { id: "14112", name: "Río Bueno" }
        ]
      },
      {
        id: "CL-14-02",
        name: "Ranco",
        comunas: [
          { id: "14201", name: "La Unión" },
          { id: "14202", name: "Futrono" },
          { id: "14203", name: "Lago Ranco" },
          { id: "14204", name: "Río Bueno" }
        ]
      }
    ]
  },
  {
    id: "CL-16",
    name: "Región de Ñuble",
    country: "Chile",
    provincias: [
      {
        id: "CL-16-01",
        name: "Diguillín",
        comunas: [
          { id: "16101", name: "Bulnes" },
          { id: "16102", name: "Cobquecura" },
          { id: "16103", name: "Coelemu" },
          { id: "16104", name: "Coihueco" },
          { id: "16105", name: "Chillán Viejo" },
          { id: "16106", name: "Chillán" },
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
        id: "CL-16-02",
        name: "Itata",
        comunas: [
          { id: "16201", name: "Quirihue" },
          { id: "16202", name: "Cobquecura" },
          { id: "16203", name: "Coelemu" },
          { id: "16204", name: "Ninhue" },
          { id: "16205", name: "Portezuelo" },
          { id: "16206", name: "Ránquil" },
          { id: "16207", name: "Treguaco" }
        ]
      },
      {
        id: "CL-16-03",
        name: "Punilla",
        comunas: [
          { id: "16301", name: "San Carlos" },
          { id: "16302", name: "San Fabián" },
          { id: "16303", name: "San Ignacio" },
          { id: "16304", name: "San Nicolás" }
        ]
      }
    ]
  },
  // === PERÚ ===
  {
    id: "PE-AMA",
    name: "Amazonas",
    country: "Peru",
    provincias: [
      {
        id: "PE-AMA-01",
        name: "Chachapoyas",
        comunas: [
          { id: "PE-AMA-01-01", name: "Chachapoyas" },
          { id: "PE-AMA-01-02", name: "Asunción" },
          { id: "PE-AMA-01-03", name: "Balsas" },
          { id: "PE-AMA-01-04", name: "Cheto" },
          { id: "PE-AMA-01-05", name: "Chiliquín" },
          { id: "PE-AMA-01-06", name: "Chuquibamba" },
          { id: "PE-AMA-01-07", name: "Granada" },
          { id: "PE-AMA-01-08", name: "Huancas" },
          { id: "PE-AMA-01-09", name: "La Jalca" },
          { id: "PE-AMA-01-10", name: "Leimebamba" },
          { id: "PE-AMA-01-11", name: "Levanto" },
          { id: "PE-AMA-01-12", name: "Magdalena" },
          { id: "PE-AMA-01-13", name: "Mariscal Castilla" },
          { id: "PE-AMA-01-14", name: "Molinopampa" },
          { id: "PE-AMA-01-15", name: "Montevideo" },
          { id: "PE-AMA-01-16", name: "Olleros" },
          { id: "PE-AMA-01-17", name: "Quinjalca" },
          { id: "PE-AMA-01-18", name: "San Francisco de Daguas" },
          { id: "PE-AMA-01-19", name: "San Isidro de Maino" },
          { id: "PE-AMA-01-20", name: "Soloco" },
          { id: "PE-AMA-01-21", name: "Sonche" }
        ]
      },
      {
        id: "PE-AMA-02",
        name: "Bagua",
        comunas: [
          { id: "PE-AMA-02-01", name: "Bagua" },
          { id: "PE-AMA-02-02", name: "Aramango" },
          { id: "PE-AMA-02-03", name: "Copallín" },
          { id: "PE-AMA-02-04", name: "El Parco" },
          { id: "PE-AMA-02-05", name: "Imaza" },
          { id: "PE-AMA-02-06", name: "La Peca" }
        ]
      },
      {
        id: "PE-AMA-03",
        name: "Bongará",
        comunas: [
          { id: "PE-AMA-03-01", name: "Jumbilla" },
          { id: "PE-AMA-03-02", name: "Chisquilla" },
          { id: "PE-AMA-03-03", name: "Churuja" },
          { id: "PE-AMA-03-04", name: "Corosha" },
          { id: "PE-AMA-03-05", name: "Cuispes" },
          { id: "PE-AMA-03-06", name: "Florida" },
          { id: "PE-AMA-03-07", name: "Jazán" },
          { id: "PE-AMA-03-08", name: "Recta" },
          { id: "PE-AMA-03-09", name: "San Carlos" },
          { id: "PE-AMA-03-10", name: "Shipasbamba" },
          { id: "PE-AMA-03-11", name: "Valera" },
          { id: "PE-AMA-03-12", name: "Yambrasbamba" }
        ]
      },
      {
        id: "PE-AMA-04",
        name: "Condorcanqui",
        comunas: [
          { id: "PE-AMA-04-01", name: "Nieva" },
          { id: "PE-AMA-04-02", name: "El Cenepa" },
          { id: "PE-AMA-04-03", name: "Río Santiago" }
        ]
      },
      {
        id: "PE-AMA-05",
        name: "Luya",
        comunas: [
          { id: "PE-AMA-05-01", name: "Lámud" },
          { id: "PE-AMA-05-02", name: "Camporredondo" },
          { id: "PE-AMA-05-03", name: "Cocabamba" },
          { id: "PE-AMA-05-04", name: "Colcamar" },
          { id: "PE-AMA-05-05", name: "Conila" },
          { id: "PE-AMA-05-06", name: "Inguilpata" },
          { id: "PE-AMA-05-07", name: "Longuita" },
          { id: "PE-AMA-05-08", name: "Lonya Chico" },
          { id: "PE-AMA-05-09", name: "Luya" },
          { id: "PE-AMA-05-10", name: "Luya Viejo" },
          { id: "PE-AMA-05-11", name: "María" },
          { id: "PE-AMA-05-12", name: "Ocalli" },
          { id: "PE-AMA-05-13", name: "Ocumal" },
          { id: "PE-AMA-05-14", name: "Pisuquía" },
          { id: "PE-AMA-05-15", name: "Providencia" },
          { id: "PE-AMA-05-16", name: "San Cristóbal" },
          { id: "PE-AMA-05-17", name: "San Francisco del Yeso" },
          { id: "PE-AMA-05-18", name: "San Jerónimo" },
          { id: "PE-AMA-05-19", name: "San Juan de Lopecancha" },
          { id: "PE-AMA-05-20", name: "Santa Catalina" },
          { id: "PE-AMA-05-21", name: "Santo Tomás" },
          { id: "PE-AMA-05-22", name: "Tingo" },
          { id: "PE-AMA-05-23", name: "Trita" }
        ]
      },
      {
        id: "PE-AMA-06",
        name: "Rodríguez de Mendoza",
        comunas: [
          { id: "PE-AMA-06-01", name: "San Nicolás" },
          { id: "PE-AMA-06-02", name: "Chirimoto" },
          { id: "PE-AMA-06-03", name: "Cochamal" },
          { id: "PE-AMA-06-04", name: "Huambo" },
          { id: "PE-AMA-06-05", name: "Limabamba" },
          { id: "PE-AMA-06-06", name: "Longar" },
          { id: "PE-AMA-06-07", name: "Mariscal Benavides" },
          { id: "PE-AMA-06-08", name: "Mílpuc" },
          { id: "PE-AMA-06-09", name: "Omia" },
          { id: "PE-AMA-06-10", name: "Santa Rosa" },
          { id: "PE-AMA-06-11", name: "Totora" },
          { id: "PE-AMA-06-12", name: "Vista Alegre" }
        ]
      },
      {
        id: "PE-AMA-07",
        name: "Utcubamba",
        comunas: [
          { id: "PE-AMA-07-01", name: "Bagua Grande" },
          { id: "PE-AMA-07-02", name: "Cajaruro" },
          { id: "PE-AMA-07-03", name: "Cumba" },
          { id: "PE-AMA-07-04", name: "El Milagro" },
          { id: "PE-AMA-07-05", name: "Jamalca" },
          { id: "PE-AMA-07-06", name: "Lonya Grande" },
          { id: "PE-AMA-07-07", name: "Yamón" }
        ]
      }
    ]
  },
  {
    id: "PE-LIM",
    name: "Lima",
    country: "Peru",
    provincias: [
      {
        id: "PE-LIM-01",
        name: "Lima",
        comunas: [
          { id: "PE-LIM-01-01", name: "Lima" },
          { id: "PE-LIM-01-02", name: "Ancón" },
          { id: "PE-LIM-01-03", name: "Ate" },
          { id: "PE-LIM-01-04", name: "Barranco" },
          { id: "PE-LIM-01-05", name: "Breña" },
          { id: "PE-LIM-01-06", name: "Carabayllo" },
          { id: "PE-LIM-01-07", name: "Chaclacayo" },
          { id: "PE-LIM-01-08", name: "Chorrillos" },
          { id: "PE-LIM-01-09", name: "Cieneguilla" },
          { id: "PE-LIM-01-10", name: "Comas" },
          { id: "PE-LIM-01-11", name: "El Agustino" },
          { id: "PE-LIM-01-12", name: "Independencia" },
          { id: "PE-LIM-01-13", name: "Jesús María" },
          { id: "PE-LIM-01-14", name: "La Molina" },
          { id: "PE-LIM-01-15", name: "La Victoria" },
          { id: "PE-LIM-01-16", name: "Lince" },
          { id: "PE-LIM-01-17", name: "Los Olivos" },
          { id: "PE-LIM-01-18", name: "Lurigancho" },
          { id: "PE-LIM-01-19", name: "Lurín" },
          { id: "PE-LIM-01-20", name: "Magdalena del Mar" },
          { id: "PE-LIM-01-21", name: "Miraflores" },
          { id: "PE-LIM-01-22", name: "Pachacámac" },
          { id: "PE-LIM-01-23", name: "Pucusana" },
          { id: "PE-LIM-01-24", name: "Pueblo Libre" },
          { id: "PE-LIM-01-25", name: "Puente Piedra" },
          { id: "PE-LIM-01-26", name: "Punta Hermosa" },
          { id: "PE-LIM-01-27", name: "Punta Negra" },
          { id: "PE-LIM-01-28", name: "Rímac" },
          { id: "PE-LIM-01-29", name: "San Bartolo" },
          { id: "PE-LIM-01-30", name: "San Borja" },
          { id: "PE-LIM-01-31", name: "San Isidro" },
          { id: "PE-LIM-01-32", name: "San Juan de Lurigancho" },
          { id: "PE-LIM-01-33", name: "San Juan de Miraflores" },
          { id: "PE-LIM-01-34", name: "San Luis" },
          { id: "PE-LIM-01-35", name: "San Martín de Porres" },
          { id: "PE-LIM-01-36", name: "San Miguel" },
          { id: "PE-LIM-01-37", name: "Santa Anita" },
          { id: "PE-LIM-01-38", name: "Santa María del Mar" },
          { id: "PE-LIM-01-39", name: "Santa Rosa" },
          { id: "PE-LIM-01-40", name: "Santiago de Surco" },
          { id: "PE-LIM-01-41", name: "Surquillo" },
          { id: "PE-LIM-01-42", name: "Villa El Salvador" },
          { id: "PE-LIM-01-43", name: "Villa María del Triunfo" }
        ]
      }
    ]
  },
  {
    id: "PE-ARE",
    name: "Arequipa",
    country: "Peru",
    provincias: [
      {
        id: "PE-ARE-01",
        name: "Arequipa",
        comunas: [
          { id: "PE-ARE-01-01", name: "Arequipa" },
          { id: "PE-ARE-01-02", name: "Alto Selva Alegre" },
          { id: "PE-ARE-01-03", name: "Cayma" },
          { id: "PE-ARE-01-04", name: "Cerro Colorado" },
          { id: "PE-ARE-01-05", name: "Characato" },
          { id: "PE-ARE-01-06", name: "Chiguata" },
          { id: "PE-ARE-01-07", name: "Jacobo Hunter" },
          { id: "PE-ARE-01-08", name: "La Joya" },
          { id: "PE-ARE-01-09", name: "Mariano Melgar" },
          { id: "PE-ARE-01-10", name: "Miraflores" },
          { id: "PE-ARE-01-11", name: "Mollebaya" },
          { id: "PE-ARE-01-12", name: "Paucarpata" },
          { id: "PE-ARE-01-13", name: "Pocsi" },
          { id: "PE-ARE-01-14", name: "Polobaya" },
          { id: "PE-ARE-01-15", name: "Quequeña" },
          { id: "PE-ARE-01-16", name: "Sabandía" },
          { id: "PE-ARE-01-17", name: "Sachaca" },
          { id: "PE-ARE-01-18", name: "San Juan de Siguas" },
          { id: "PE-ARE-01-19", name: "San Juan de Tarucani" },
          { id: "PE-ARE-01-20", name: "Santa Isabel de Siguas" },
          { id: "PE-ARE-01-21", name: "Santa Rita de Siguas" },
          { id: "PE-ARE-01-22", name: "Socabaya" },
          { id: "PE-ARE-01-23", name: "Tiabaya" },
          { id: "PE-ARE-01-24", name: "Uchumayo" },
          { id: "PE-ARE-01-25", name: "Vitor" },
          { id: "PE-ARE-01-26", name: "Yanahuara" },
          { id: "PE-ARE-01-27", name: "Yarabamba" },
          { id: "PE-ARE-01-28", name: "Yura" },
          { id: "PE-ARE-01-29", name: "José Luis Bustamante y Rivero" }
        ]
      }
    ]
  }
];

// Función helper para buscar provincias por región
export const findProvinciasByRegion = (regionId: string): Provincia[] => {
  const region = chilePeruRegionsCommunes.find(r => r.id === regionId);
  return region ? region.provincias : [];
};

// Función helper para buscar comunas por provincia
export const findComunasByProvincia = (provinciaId: string): Comuna[] => {
  for (const region of chilePeruRegionsCommunes) {
    const provincia = region.provincias.find(p => p.id === provinciaId);
    if (provincia) {
      return provincia.comunas;
    }
  }
  return [];
};

// Función helper para buscar región por provincia
export const findRegionByProvincia = (provinciaId: string): Region | undefined => {
  return chilePeruRegionsCommunes.find(region => 
    region.provincias.some(provincia => provincia.id === provinciaId)
  );
};

// Función helper para buscar región por comuna
export const findRegionByComuna = (comunaId: string): Region | undefined => {
  return chilePeruRegionsCommunes.find(region => 
    region.provincias.some(provincia => 
      provincia.comunas.some(comuna => comuna.id === comunaId)
    )
  );
};

// Función helper para buscar provincia por comuna
export const findProvinciaByComuna = (comunaId: string): Provincia | undefined => {
  for (const region of chilePeruRegionsCommunes) {
    const provincia = region.provincias.find(p => 
      p.comunas.some(c => c.id === comunaId)
    );
    if (provincia) {
      return provincia;
    }
  }
  return undefined;
};

// Función helper para filtrar por país
export const getRegionsByCountry = (country: 'Chile' | 'Peru'): Region[] => {
  return chilePeruRegionsCommunes.filter(region => region.country === country);
};
