import { MaterialSpec } from "@/types";

export const MATERIALS_DATA: MaterialSpec[] = [
  {
    id: "stone",
    name: "STONE",
    subhead: "MONUMENTAL BEDROCK & FOSSIL EARTH",
    heritageStory: "Sedimentary sandstone from Marwar, crystalline calcitic marble from Makrana, and Jurassic fossil limestone from Jaisalmer. These stones have weathered scorching desert afternoons and cold starlit nights for geological epochs.",
    tactileDescription: "Matte, micro-granular surface that absorbs ambient warmth. Fine microscopic ridges from river silt hand-burnishing offer a dry, velvet touch without plastic varnish.",
    aestheticQualities: [
      "Natural iron-oxide geological striations",
      "Translucent calcite rim diffusion under direct raking light",
      "Subtle quartz crystal sparkle in warm sunlight",
      "Deepening earthen patina that absorbs environment over decades"
    ],
    originRegions: ["Jodhpur (Desert Rose Sandstone)", "Makrana (Albeta White Marble)", "Jaisalmer (Golden Fossil Stone)"],
    textureType: "sandstone",
    bgClass: "sandstone-texture",
    heroImage: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1600&auto=format&fit=crop"
  },
  {
    id: "silver",
    name: "GERMAN SILVER",
    subhead: "THE COLD LUSTRE OF ROYAL PALACES",
    heritageStory: "Known historically as Maillechort or Alpaca, this noble alloy of copper, nickel, and zinc was favoured by the Mewari and Rajput courts for monumental throne canopies, ceremonial chariots, and palanquins due to its silver-white brilliance and heroic durability.",
    tactileDescription: "Subtle cool metallic temperature upon contact, followed by silky hand-burnished smoothness. Microscopic hand-hammering indentations impart a rhythmic tactile landscape.",
    aestheticQualities: [
      "Soft, non-glaring moonstone diffuse reflection",
      "Rich antique shadow accumulation in chased recesses",
      "Immunity to black brittle tarnishing under desert humidity",
      "Hand-rolled heavy gauge sheet resilience"
    ],
    originRegions: ["Jaipur (Johari Bazaar Ateliers)", "Udaipur (Kasera Foundry)"],
    textureType: "silver",
    bgClass: "silver-sheen",
    heroImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1600&auto=format&fit=crop"
  },
  {
    id: "artifacts",
    name: "ARTIFACTS",
    subhead: "ARCHIVAL MEMORY & RECLAIMED TIMBER",
    heritageStory: "Centuries-old architectural elements carefully rescued from endangered 18th- and 19th-century merchant havelis across Shekhawati and Bikaner. Each fragment contains original joinery, hand-forged iron spikes, and weathered patinas born of desert trade caravans.",
    tactileDescription: "Deeply weathered open grain with stabilized antique cracks, treated exclusively with walnut oil and natural dammar resin for an authentic dry antique hand-feel.",
    aestheticQualities: [
      "140+ years of natural desert seasoning and wood maturation",
      "Iron gall ink and oxidized nail halo markings",
      "Aged brass and lost-wax cast bronze brackets",
      "Unrepeatable geological and organic historical weathering"
    ],
    originRegions: ["Mandawa (Shekhawati Haveli Belt)", "Bikaner (Junagarh Environs)"],
    textureType: "patina",
    bgClass: "artifact-patina",
    heroImage: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1600&auto=format&fit=crop"
  }
];
