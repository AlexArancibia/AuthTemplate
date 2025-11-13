/**
 * Configuración centralizada de deportistas
 * Usado por: DeportistasCarousel y página nuestros-deportistas
 */

export interface DeportistaConfig {
  filename: string
  name: string
  order: number
}

// Orden de deportistas - cambiar aquí afecta a carrusel y página
export const DEPORTISTAS_CONFIG: DeportistaConfig[] = [
  { filename: "Rodrigo Hidalgo.jpg", name: "Rodrigo Hidalgo", order: 1 },
  { filename: "Keiji Takeda.jpg", name: "Keiji Takeda", order: 2 },
  { filename: "Nano Fernández.jpg", name: "Nano Fernández", order: 3 },
  { filename: "Gonzalo Vera.jpg", name: "Gonzalo Vera", order: 4 },
  { filename: "Ana Paula Yenobi.jpg", name: "Ana Paula Yenobi", order: 5 },
  { filename: "Bryan Blas.jpg", name: "Bryan Blas", order: 6 },
  { filename: "Santiago Uribe.jpg", name: "Santiago Uribe", order: 7 },
  { filename: "Alicia Zamora.jpg", name: "Alicia Zamora", order: 8 },
  { filename: "Cristian Isla.jpg", name: "Cristian Isla", order: 9 },
  { filename: "Cayetana Guzmán.jpg", name: "Cayetana Guzmán", order: 10 },
  { filename: "Erika Yamanaka.jpg", name: "Erika Yamanaka", order: 11 },
  { filename: "Guadalupe Gómez Sanchez.jpg", name: "Guadalupe Gómez Sanchez", order: 12 },
  { filename: "Josue Portalatino.jpg", name: "Josue Portalatino", order: 13 },
  { filename: "Julie Westerkam.jpg", name: "Julie Westerkam", order: 14 },
  { filename: "Kiara Tafur.jpg", name: "Kiara Tafur", order: 15 },
  { filename: "Luis Perez.jpg", name: "Luis Perez", order: 16 },
  { filename: "Maria Jimena Luna.jpg", name: "Maria Jimena Luna", order: 17 },
]

// Helper: Obtener array de filenames ordenados (para carrusel y página)
export const getDeportistasFilenames = (): string[] => {
  return [...DEPORTISTAS_CONFIG]
    .sort((a, b) => a.order - b.order)
    .map(d => d.filename)
}

// Helper: Obtener nombre del deportista desde filename
export const getDeportistaName = (filename: string): string => {
  const deportista = DEPORTISTAS_CONFIG.find(d => d.filename === filename)
  return deportista?.name || filename.replace(/\.(jpg|jpeg|png)$/i, '')
}

// Helper: Obtener todos los deportistas ordenados con sus datos
export const getDeportistasOrdered = (): DeportistaConfig[] => {
  return [...DEPORTISTAS_CONFIG].sort((a, b) => a.order - b.order)
}

