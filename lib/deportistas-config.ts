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
  { filename: "Rodrigo Hidalgo.JPG", name: "Rodrigo Hidalgo", order: 1 },
  { filename: "Keiji Takeda.JPG", name: "Keiji Takeda", order: 2 },
  { filename: "Nano Fernández.JPG", name: "Nano Fernández", order: 3 },
  { filename: "Ana Paula Yenobi.JPG", name: "Ana Paula Yenobi", order: 4 },
  { filename: "Bryan Blas.JPG", name: "Bryan Blas", order: 5 },
  { filename: "Santiago Uribe.JPG", name: "Santiago Uribe", order: 6 },
  { filename: "Alicia Zamora.JPG", name: "Alicia Zamora", order: 7 },
  { filename: "Cayetana Guzmán.jpeg", name: "Cayetana Guzmán", order: 8 },
  { filename: "Erika Yamanaka.JPG", name: "Erika Yamanaka", order: 9 },
  { filename: "Guadalupe Gómez Sanchez.png", name: "Guadalupe Gómez Sanchez", order: 10 },
  { filename: "Josue Portalatino.png", name: "Josue Portalatino", order: 11 },
  { filename: "Julie Westerkam.png", name: "Julie Westerkam", order: 12 },
  { filename: "Kiara Tafur.JPG", name: "Kiara Tafur", order: 13 },
  { filename: "Luis Perez.JPG", name: "Luis Perez", order: 14 },
  { filename: "Maria Jimena Luna.JPG", name: "Maria Jimena Luna", order: 15 },
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

