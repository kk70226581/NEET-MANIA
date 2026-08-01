# 1–70 Single-correct MCQs
questions = []
def add(qtype, difficulty, section, topic, page, pdf_page, question, a, b, c, d, answer, explanation):
    questions.append({
        "Question ID": len(questions)+1,
        "Chapter": "Chapter 12 – Ecosystem",
        "Section": section,
        "Topic": topic,
        "NCERT Page": page,
        "PDF Page": pdf_page,
        "Question Type": qtype,
        "Difficulty": difficulty,
        "Question": question,
        "Option A": a,
        "Option B": b,
        "Option C": c,
        "Option D": d,
        "Correct Answer": answer,
        "Answer Explanation": explanation,
        "Source": f"NCERT Biology, Chapter 12 Ecosystem, p. {page}"
    })

# 1–70 Single-correct MCQs
add("Single Correct MCQ","Medium","12.1 Ecosystem–Structure and Function","Types of ecosystems",205,1,
"Which set contains only aquatic ecosystems as classified in the chapter?",
"Forest, grassland and desert","Pond, lake and estuary","Crop field, aquarium and forest","Wetland, desert and river","B",
"Pond, lake, wetland, river and estuary are aquatic ecosystems.")
add("Single Correct MCQ","Medium","12.1 Ecosystem–Structure and Function","Man-made ecosystems",205,1,
"Which pair is correctly identified as man-made ecosystems?",
"Forest and grassland","Pond and lake","Crop field and aquarium","River and estuary","C",
"Crop fields and aquaria may be considered man-made ecosystems.")
add("Single Correct MCQ","Hard","12.1 Ecosystem–Structure and Function","Functional view of ecosystem",205,1,
"To study an ecosystem as a functional unit, which sequence best represents the chapter’s framework?",
"Output → input → nutrient loss → stratification","Input through productivity → energy transfer → degradation and energy loss","Species composition → mutation → succession → extinction","Biomass accumulation → gene flow → decomposition → speciation","B",
"The chapter introduces input as productivity, transfer through food chains/webs and nutrient cycling, and output as degradation and energy loss.")
add("Single Correct MCQ","Medium","12.1 Ecosystem–Structure and Function","Species composition",206,2,
"Identification and enumeration of plant and animal species of an ecosystem gives its:",
"Standing crop","Species composition","Stratification","Productivity","B",
"Species composition is obtained by identifying and enumerating species.")
add("Single Correct MCQ","Medium","12.1 Ecosystem–Structure and Function","Stratification",206,2,
"In a forest, trees, shrubs, and herbs occupying different vertical layers illustrate:",
"Mineralisation","Stratification","Secondary productivity","Leaching","B",
"Vertical distribution of species at different levels is called stratification.")
add("Single Correct MCQ","Hard","12.1 Ecosystem–Structure and Function","Ecosystem functions",206,2,
"Which of the following is NOT listed among the four functional aspects through which ecosystem components act as a unit?",
"Productivity","Decomposition","Energy flow","Ecological succession","D",
"The four listed aspects are productivity, decomposition, energy flow and nutrient cycling.")
add("Single Correct MCQ","Medium","12.1 Ecosystem–Structure and Function","Pond ecosystem",206,2,
"In a pond ecosystem, the rich soil deposit at the bottom is mainly included under the:",
"Autotrophic component","Abiotic component","Consumer component","Decomposer component","B",
"Water, dissolved substances and bottom soil deposit form the abiotic component.")
add("Single Correct MCQ","Medium","12.1 Ecosystem–Structure and Function","Pond producers",206,2,
"Which group represents autotrophic components of a pond?",
"Zooplankton and bottom dwellers","Fungi, bacteria and flagellates","Phytoplankton, algae and submerged plants","Free-swimming animals and molluscs","C",
"Pond autotrophs include phytoplankton, algae and floating, submerged and marginal plants.")
add("Single Correct MCQ","Medium","12.1 Ecosystem–Structure and Function","Pond decomposers",206,2,
"Decomposers especially abundant at the bottom of a pond include:",
"Fishes, frogs and insects","Fungi, bacteria and flagellates","Phytoplankton and algae","Zooplankton and molluscs","B",
"The chapter identifies fungi, bacteria and flagellates as pond decomposers.")
add("Single Correct MCQ","Hard","12.1 Ecosystem–Structure and Function","Energy movement",206,2,
"Which statement best describes energy movement in a pond ecosystem?",
"It cycles repeatedly between trophic levels","It moves unidirectionally towards higher trophic levels and is dissipated as heat","It returns completely to producers through mineralisation","It remains stored permanently in consumers","B",
"Energy movement is unidirectional and some energy is dissipated as heat.")

add("Single Correct MCQ","Medium","12.2 Productivity","Primary production",207,3,
"Primary production is the amount of biomass or organic matter produced:",
"By consumers per unit area per unit time","By plants during photosynthesis per unit area over a time period","By decomposers during mineralisation","At all trophic levels without reference to time","B",
"Primary production refers to plant biomass or organic matter produced during photosynthesis per unit area over time.")
add("Single Correct MCQ","Hard","12.2 Productivity","Units of productivity",207,3,
"Which unit is appropriate for expressing productivity rather than standing biomass?",
"g m⁻²","kcal m⁻²","g m⁻² yr⁻¹","kg per organism","C",
"Productivity is a rate and includes a time term, such as g m⁻² yr⁻¹.")
add("Single Correct MCQ","Medium","12.2 Productivity","GPP and NPP",207,3,
"If gross primary productivity is 2,400 kcal m⁻² yr⁻¹ and plant respiration is 900 kcal m⁻² yr⁻¹, NPP equals:",
"1,500 kcal m⁻² yr⁻¹","2,400 kcal m⁻² yr⁻¹","3,300 kcal m⁻² yr⁻¹","900 kcal m⁻² yr⁻¹","A",
"NPP = GPP − R = 2,400 − 900 = 1,500 kcal m⁻² yr⁻¹.")
add("Single Correct MCQ","Hard","12.2 Productivity","NPP significance",207,3,
"Net primary productivity is ecologically important because it represents:",
"Total solar radiation incident on plants","Biomass available for consumption by herbivores and decomposers","Energy lost only through animal respiration","Rate of humus formation","B",
"NPP is the biomass available to heterotrophs, including herbivores and decomposers.")
add("Single Correct MCQ","Medium","12.2 Productivity","Secondary productivity",207,3,
"Secondary productivity is the rate of formation of new organic matter by:",
"Producers","Consumers","Decomposers only","All autotrophs","B",
"Secondary productivity is new organic matter formed by consumers.")
add("Single Correct MCQ","Hard","12.2 Productivity","Factors affecting productivity",207,3,
"Which combination can directly affect primary productivity according to the chapter?",
"Plant species, nutrients, environmental factors and photosynthetic capacity","Only consumer density and trophic level","Only rainfall and decomposer abundance","Only detritus quality and temperature","A",
"Primary productivity depends on plant species, environmental factors, nutrient availability and photosynthetic capacity.")
add("Single Correct MCQ","Medium","12.2 Productivity","Biosphere productivity",207,3,
"The approximate annual net primary productivity of the whole biosphere is:",
"55 billion tonnes dry weight","115 billion tonnes dry weight","170 billion tonnes dry weight","225 billion tonnes dry weight","C",
"The chapter gives approximately 170 billion tonnes dry weight.")
add("Single Correct MCQ","Hard","12.2 Productivity","Ocean productivity",207,3,
"Oceans occupy about 70% of Earth’s surface but contribute approximately what fraction of global annual NPP mentioned in the chapter?",
"About one-third","About one-half","About two-thirds","About nine-tenths","A",
"Ocean NPP is 55 of 170 billion tonnes, approximately one-third.")
add("Single Correct MCQ","Hard","12.2 Productivity","Production calculations",207,3,
"An ecosystem has GPP of 3,000 units. If 40% of GPP is used in plant respiration, its NPP is:",
"1,200 units","1,800 units","3,000 units","4,200 units","B",
"Respiration = 1,200; NPP = 3,000 − 1,200 = 1,800.")
add("Single Correct MCQ","Medium","12.2 Productivity","Rate versus amount",207,3,
"The term ‘rate of biomass production’ specifically denotes:",
"Primary production","Productivity","Standing crop","Standing state","B",
"Productivity is the rate of biomass production.")

add("Single Correct MCQ","Medium","12.3 Decomposition","Definition of decomposition",207,3,
"Decomposition converts complex organic matter primarily into:",
"Only humus","Carbon dioxide, water and inorganic nutrients","Glucose and oxygen","New consumer biomass only","B",
"Decomposers convert complex organic matter into carbon dioxide, water and nutrients.")
add("Single Correct MCQ","Medium","12.3 Decomposition","Detritus",207,3,
"Which of the following is NOT a component of detritus?",
"Dead leaves","Animal remains","Faecal matter","Living phytoplankton","D",
"Detritus consists of dead plant and animal remains, including faecal matter.")
add("Single Correct MCQ","Medium","12.3 Decomposition","Steps of decomposition",207,3,
"Which sequence contains only important steps of decomposition?",
"Fragmentation, leaching, catabolism, humification, mineralisation","Photosynthesis, respiration, predation, migration, leaching","Stratification, production, assimilation, succession, mineralisation","Fixation, ammonification, nitrification, denitrification, leaching","A",
"The five listed steps are fragmentation, leaching, catabolism, humification and mineralisation.")
add("Single Correct MCQ","Medium","12.3 Decomposition","Fragmentation",207,3,
"Earthworms aid decomposition mainly by:",
"Humification","Fragmentation","Mineralisation","Photosynthesis","B",
"Detritivores such as earthworms break detritus into smaller particles, called fragmentation.")
add("Single Correct MCQ","Hard","12.3 Decomposition","Leaching",207,3,
"During leaching, water-soluble inorganic nutrients:",
"Move upward and become gaseous","Move downward into deeper soil horizons and may precipitate as unavailable salts","Are converted directly into humus","Are absorbed only by detritivores","B",
"Leaching carries soluble nutrients downward where they may precipitate as unavailable salts.")
add("Single Correct MCQ","Medium","12.3 Decomposition","Catabolism",207,3,
"Catabolism during decomposition is mainly brought about by:",
"Mechanical grinding by detritivores","Bacterial and fungal enzymes","Solar radiation","Herbivore digestion only","B",
"Microbial enzymes degrade detritus into simpler inorganic substances.")
add("Single Correct MCQ","Hard","12.3 Decomposition","Simultaneous processes",207,3,
"Which statement about decomposition steps is correct?",
"They occur in a rigid sequence and never overlap","Fragmentation alone must finish before leaching begins","Several decomposition steps operate simultaneously on detritus","Humification occurs only in water bodies","C",
"The chapter notes that decomposition steps operate simultaneously.")
add("Single Correct MCQ","Medium","12.3 Decomposition","Humus",208,4,
"Humus is best described as:",
"A light-coloured soluble sugar","A dark amorphous, colloidal substance resistant to microbial action","A living microbial biomass","An inorganic salt rapidly leached from soil","B",
"Humus is dark, amorphous, colloidal and highly resistant to microbial action.")
add("Single Correct MCQ","Hard","12.3 Decomposition","Humus function",208,4,
"The colloidal nature of humus is significant because humus:",
"Acts as a reservoir of nutrients","Becomes completely unavailable to microbes","Prevents all mineralisation","Produces solar energy","A",
"Being colloidal, humus serves as a nutrient reservoir.")
add("Single Correct MCQ","Medium","12.3 Decomposition","Mineralisation",208,4,
"Release of inorganic nutrients when humus is further degraded by microbes is called:",
"Fragmentation","Leaching","Mineralisation","Stratification","C",
"Microbial degradation of humus releasing inorganic nutrients is mineralisation.")
add("Single Correct MCQ","Medium","12.3 Decomposition","Oxygen requirement",208,4,
"Decomposition is largely:",
"An oxygen-requiring process","Independent of oxygen","Restricted to anaerobic habitats","A photosynthetic process","A",
"The text states that decomposition is largely oxygen-requiring.")
add("Single Correct MCQ","Hard","12.3 Decomposition","Detritus chemistry",208,4,
"Under the same climatic conditions, which detritus is expected to decompose slowest?",
"Rich in nitrogen and soluble sugars","Rich in lignin and chitin","Rich in water-soluble substances","Poor in structural compounds","B",
"Lignin- and chitin-rich detritus decomposes more slowly.")
add("Single Correct MCQ","Hard","12.3 Decomposition","Climatic regulation",208,4,
"Which condition would most strongly favour rapid decomposition?",
"Low temperature and waterlogging","Warm, moist and aerobic soil","Cold, dry and anaerobic soil","High lignin with low microbial activity","B",
"Warm and moist conditions favour microbial activity and decomposition.")
add("Single Correct MCQ","Medium","12.3 Decomposition","Organic matter accumulation",208,4,
"Build-up of organic materials is favoured by:",
"Warmth and adequate aeration","Low temperature and anaerobiosis","High nitrogen and soluble sugars","Rapid mineralisation","B",
"Low temperature and anaerobiosis inhibit decomposition, causing accumulation.")
add("Single Correct MCQ","Hard","12.3 Decomposition","Rate comparison",208,4,
"Four leaf litters are kept under identical warm and moist conditions. Which will probably decompose fastest?",
"High lignin, high chitin","High nitrogen, high soluble sugars","High lignin, low nitrogen","High chitin, low soluble material","B",
"Nitrogen- and water-soluble-substance-rich detritus decomposes faster.")

add("Single Correct MCQ","Medium","12.4 Energy Flow","PAR",209,5,
"Photosynthetically active radiation constitutes:",
"More than 90% of incident solar radiation","Less than 50% of incident solar radiation","Exactly 10% of incident solar radiation","Only 1% of incident solar radiation","B",
"Less than 50% of incident solar radiation is PAR.")
add("Single Correct MCQ","Medium","12.4 Energy Flow","Energy capture by plants",209,5,
"Plants generally capture what percentage of PAR?",
"Less than 1%","2–10%","20–50%","70–90%","B",
"Plants capture only 2–10% of PAR.")
add("Single Correct MCQ","Hard","12.4 Energy Flow","Energy source exception",209,5,
"The major exception to the statement that the Sun is the source of energy for ecosystems is:",
"Deep-sea hydrothermal ecosystem","Grassland ecosystem","Estuarine ecosystem","Desert ecosystem","A",
"Deep-sea hydrothermal ecosystems are specifically mentioned as an exception.")
add("Single Correct MCQ","Medium","12.4 Energy Flow","Producers",209,5,
"Major producers in a terrestrial ecosystem are:",
"Only phytoplankton","Herbaceous and woody plants","Fungi and bacteria","Molluscs and insects","B",
"Terrestrial producers include herbaceous and woody plants.")
add("Single Correct MCQ","Medium","12.4 Energy Flow","Aquatic producers",209,5,
"Which group contains aquatic producers?",
"Phytoplankton, algae and higher plants","Molluscs, fishes and zooplankton","Bacteria, fungi and flagellates only","Birds, insects and mammals","A",
"Aquatic producers include phytoplankton, algae and higher plants.")
add("Single Correct MCQ","Hard","12.4 Energy Flow","Fate of captured energy",209,5,
"Energy trapped by a producer ultimately:",
"Remains permanently stored in the producer","Is passed to a consumer or enters detritus after death","Cycles back completely to sunlight","Is converted entirely into nutrients","B",
"Captured energy is passed to consumers or enters the detritus pathway after death.")
add("Single Correct MCQ","Medium","12.4 Energy Flow","Consumer levels",209,5,
"In the chain Grass → Goat → Human, the goat is:",
"Producer","Primary consumer","Secondary consumer","Decomposer","B",
"The goat feeds directly on grass and is a primary consumer.")
add("Single Correct MCQ","Hard","12.4 Energy Flow","Consumer terminology",209,5,
"An animal that feeds on a herbivore is correctly called:",
"A producer and first trophic level organism","A primary carnivore but secondary consumer","A secondary carnivore but primary consumer","A decomposer and tertiary consumer","B",
"It is a primary carnivore in carnivore terminology and a secondary consumer by trophic position.")
add("Single Correct MCQ","Medium","12.4 Energy Flow","Detritus food chain",210,6,
"The detritus food chain begins with:",
"Living producers","Dead organic matter","Primary consumers","Inorganic nutrients","B",
"DFC starts with dead organic matter.")
add("Single Correct MCQ","Medium","12.4 Energy Flow","Saprotrophs",210,6,
"Decomposers are called saprotrophs because they:",
"Produce their own food","Decompose dead organic matter","Feed only on living producers","Fix solar energy","B",
"Saprotrophs obtain energy and nutrients by degrading detritus.")
add("Single Correct MCQ","Hard","12.4 Energy Flow","Decomposer nutrition",210,6,
"Which sequence correctly describes decomposer feeding?",
"Engulf detritus → photosynthesise → release oxygen","Secrete enzymes → break down dead matter → absorb simpler materials","Capture prey → digest internally → mineralise humus","Fix nitrogen → form detritus → consume producers","B",
"Decomposers secrete digestive enzymes externally and then absorb simpler products.")
add("Single Correct MCQ","Hard","12.4 Energy Flow","Major energy conduit",210,6,
"Which comparison is correct?",
"GFC dominates terrestrial ecosystems, while DFC dominates aquatic ecosystems","GFC is the major conduit in aquatic ecosystems, while a larger fraction flows through DFC in terrestrial ecosystems","DFC is absent from aquatic ecosystems","GFC and DFC are completely isolated in all ecosystems","B",
"NCERT contrasts aquatic GFC dominance with larger terrestrial flow through DFC.")
add("Single Correct MCQ","Medium","12.4 Energy Flow","Food web",210,6,
"Natural interconnections among food chains form a:",
"Trophic level","Food web","Standing crop","Pyramid of energy","B",
"Interconnected food chains constitute a food web.")
add("Single Correct MCQ","Hard","12.4 Energy Flow","Food-chain linkage",210,6,
"Which observation best explains how DFC and GFC become connected?",
"Decomposers become producers","Some DFC organisms are prey for GFC animals and some animals are omnivores","Energy flows backward from carnivores to plants","All trophic levels contain only one species","B",
"Predation on DFC organisms and omnivory link the chains.")
add("Single Correct MCQ","Medium","12.4 Energy Flow","Trophic levels",210,6,
"Producers, herbivores and secondary consumers occupy respectively:",
"First, second and third trophic levels","Second, third and fourth trophic levels","First, third and fifth trophic levels","Third, second and first trophic levels","A",
"Producers are first, herbivores second and secondary consumers third trophic level.")
add("Single Correct MCQ","Hard","12.4 Energy Flow","Functional trophic level",213,9,
"A sparrow eating seeds and later eating insects demonstrates that:",
"A species can occupy more than one trophic level","Trophic level is fixed genetically","Only omnivores are producers","Energy pyramids may invert","A",
"Trophic level is functional, not species-specific; a sparrow may be primary or secondary consumer.")
add("Single Correct MCQ","Medium","12.4 Energy Flow","Standing crop",211,7,
"Standing crop refers to:",
"Rate of biomass production","Mass or number of living organisms at a trophic level at a particular time","Amount of inorganic nutrients in soil","Annual energy loss as heat","B",
"Standing crop is the living material present at a trophic level at a particular time.")
add("Single Correct MCQ","Hard","12.4 Energy Flow","Biomass measurement",211,7,
"Dry weight is generally more accurate than fresh weight for biomass estimation because it:",
"Reduces variation due to water content","Includes dissolved nutrients","Measures productivity directly","Counts all individuals","A",
"This is an inference from NCERT’s preference for dry weight: water content can vary substantially.")
add("Single Correct MCQ","Medium","12.4 Energy Flow","10% law",211,7,
"According to the 10% law, if producers contain 20,000 J, energy available to primary consumers is approximately:",
"20 J","200 J","2,000 J","18,000 J","C",
"About 10% of producer energy, or 2,000 J, is transferred.")
add("Single Correct MCQ","Hard","12.4 Energy Flow","10% law calculation",211,7,
"In a four-level grazing chain, producers contain 100,000 J. Approximate energy at the fourth trophic level is:",
"10,000 J","1,000 J","100 J","10 J","C",
"Energy transfers: 100,000 → 10,000 → 1,000 → 100 J.")
add("Single Correct MCQ","Hard","12.4 Energy Flow","Length of food chain",211,7,
"The number of trophic levels in a grazing food chain is restricted mainly because:",
"Producers cannot form biomass","Energy decreases sharply at successive transfers","Consumers do not respire","Nutrients never cycle","B",
"Only about 10% energy transfers to the next level, limiting chain length.")

add("Single Correct MCQ","Medium","12.5 Ecological Pyramids","Types of pyramids",212,8,
"Ecological relationships at trophic levels are commonly expressed in terms of:",
"Number, biomass and energy","Age, sex and mutation rate","Temperature, rainfall and pH only","GPP, respiration and NPP only","A",
"The three ecological pyramids are of number, biomass and energy.")
add("Single Correct MCQ","Medium","12.5 Ecological Pyramids","Pyramid base and apex",212,8,
"In an ecological pyramid, the base and apex usually represent respectively:",
"Consumers and decomposers","Producers and top-level consumers","Detritivores and producers","Secondary and primary consumers","B",
"Producers form the base; tertiary or top consumers form the apex.")
add("Single Correct MCQ","Hard","12.5 Ecological Pyramids","Grassland numbers",212,8,
"A grassland ecosystem supporting millions of plants but only a few top carnivores shows an upright pyramid of:",
"Biomass only","Numbers","Energy only","Nutrients","B",
"The figure shows an upright pyramid of numbers in grassland.")
add("Single Correct MCQ","Hard","12.5 Ecological Pyramids","Aquatic biomass",212,8,
"An inverted pyramid of biomass in an aquatic ecosystem is possible because:",
"A small standing crop of phytoplankton supports a larger standing crop of zooplankton","Energy increases at higher trophic levels","Consumers perform photosynthesis","Phytoplankton have no productivity","A",
"NCERT illustrates a small phytoplankton standing crop supporting larger zooplankton biomass.")
add("Single Correct MCQ","Hard","12.5 Ecological Pyramids","Energy pyramid",213,9,
"Why can a pyramid of energy never be inverted?",
"Producer numbers are always highest","Energy is lost as heat at every transfer","Biomass is always greatest in producers","Consumers cannot occupy multiple trophic levels","B",
"Energy decreases at each trophic transfer because some is lost as heat.")
add("Single Correct MCQ","Medium","12.5 Ecological Pyramids","Energy bar meaning",213,9,
"Each bar in a pyramid of energy represents energy present:",
"Only in one individual","At a trophic level over a given time or annually per unit area","Only as standing biomass without time","Only as heat loss","B",
"Energy bars refer to energy at each trophic level per unit area over a defined time.")
add("Single Correct MCQ","Hard","12.5 Ecological Pyramids","Sampling limitation",213,9,
"Why must calculations of number, biomass or energy include all organisms at a trophic level?",
"Small samples can lead to invalid generalisations","Every species occupies one fixed trophic level","Only producers can be sampled","Ecological pyramids exclude consumers","A",
"NCERT warns that generalisations may fail when only a few individuals are considered.")
add("Single Correct MCQ","Medium","12.5 Ecological Pyramids","Tree ecosystem",213,9,
"A single large tree supporting many insects is likely to produce an inverted pyramid of:",
"Energy","Numbers","Biomass in the sea","Productivity","B",
"Few producers can support numerous herbivorous insects, inverting the number pyramid.")
add("Single Correct MCQ","Hard","12.5 Ecological Pyramids","General pyramid patterns",213,9,
"Which statement is always true according to the chapter?",
"Pyramid of numbers is always upright","Pyramid of biomass is always upright","Energy at a lower trophic level exceeds that at the next higher level","Producers always outnumber consumers","C",
"Energy always decreases toward higher trophic levels; number and biomass can show exceptions.")
add("Single Correct MCQ","Medium","12.5 Ecological Pyramids","Marine biomass pyramid",213,9,
"The pyramid of biomass in the sea is generally:",
"Upright because phytoplankton biomass exceeds fish biomass","Inverted because fish biomass may exceed phytoplankton standing crop","Always spindle-shaped","Absent because energy does not flow","B",
"Marine biomass pyramids are generally inverted in terms of standing crop.")
add("Single Correct MCQ","Hard","12.5 Ecological Pyramids","Limitations",214,10,
"Which is a limitation of ecological pyramids?",
"They always include food webs completely","They give saprophytes a separate trophic level","They assume a simple food chain and do not accommodate food webs","They account perfectly for species at multiple trophic levels","C",
"Ecological pyramids assume a simple chain, omit food-web complexity and do not properly account for multi-trophic species.")
add("Single Correct MCQ","Hard","12.5 Ecological Pyramids","Limitations",214,10,
"Saprophytes create a limitation for conventional ecological pyramids because:",
"They are assigned to every bar","They are not given a place despite their vital role","They convert all energy into biomass","They are always top consumers","B",
"NCERT states saprophytes are not given a place in ecological pyramids.")
add("Single Correct MCQ","Hard","12.5 Ecological Pyramids","Ideal energy pyramid",213,9,
"In the ideal energy pyramid shown, if producers possess 10,000 J, the top consumer level contains:",
"10,000 J","1,000 J","100 J","10 J","D",
"The diagram follows successive tenfold decreases: 10,000 → 1,000 → 100 → 10 J.")
add("Single Correct MCQ","Hard","12.4 Energy Flow","Combined energy calculation",209,5,
"If 1,000,000 J of incident solar energy reaches an ecosystem, less than 50% is PAR and plants capture 2–10% of PAR. Which value could plausibly be captured by plants?",
"600,000 J","300,000 J","25,000 J","150,000 J","C",
"With PAR below 500,000 J, plant capture at 2–10% would be below 50,000 J; 25,000 J is plausible.")
add("Single Correct MCQ","Hard","12.2 Productivity","GPP–NPP interpretation",207,3,
"Two ecosystems have equal GPP, but ecosystem X has higher plant respiration than Y. Therefore:",
"X has higher NPP","Y has higher NPP","Both must have equal NPP","No relation can be inferred","B",
"NPP = GPP − respiration; lower respiration in Y gives higher NPP.")
add("Single Correct MCQ","Hard","12.3 Decomposition","Integrated decomposition",208,4,
"Which change would most likely decrease decomposition rate while increasing organic matter accumulation?",
"Increase temperature and aeration","Increase soluble sugars and nitrogen","Lower temperature and create anaerobic conditions","Increase moisture without oxygen limitation","C",
"Low temperature and anaerobiosis inhibit decomposition and promote organic matter build-up.")
add("Single Correct MCQ","Hard","12.4 Energy Flow","Trophic classification",210,6,
"A crow consumes grains, insects and dead organic scraps. This most directly indicates:",
"It is restricted to the first trophic level","It may link grazing and detritus pathways through omnivory","It is exclusively a decomposer","It makes the energy pyramid inverted","B",
"Omnivores can connect grazing and detritus food chains.")
add("Single Correct MCQ","Hard","12.5 Ecological Pyramids","Functional levels",213,9,
"Which statement is most accurate?",
"A trophic level is synonymous with a species","A species occupies only one trophic level in an ecosystem","Trophic level describes a functional feeding position","Trophic levels are determined only by body size","C",
"Trophic level is a functional level based on feeding relationship, not a species identity.")

# 71–85 Assertion–Reason
ar_opts = (
"A. Both Assertion and Reason are true, and Reason is the correct explanation of Assertion.",
"B. Both Assertion and Reason are true, but Reason is not the correct explanation of Assertion.",
"C. Assertion is true, but Reason is false.",
"D. Assertion is false, but Reason is true."
)
def add_ar(difficulty, section, topic, page, pdf_page, assertion, reason, answer, explanation):
    add("Assertion–Reason",difficulty,section,topic,page,pdf_page,
        f"Assertion (A): {assertion}\nReason (R): {reason}",
        ar_opts[0], ar_opts[1], ar_opts[2], ar_opts[3], answer, explanation)

add_ar("Medium","12.1 Ecosystem–Structure and Function","Energy flow",206,2,
"Energy movement in an ecosystem is unidirectional.",
"Energy dissipated as heat is not recycled back to producers as usable energy.","A",
"Both are true, and heat loss explains why energy flow is unidirectional.")
add_ar("Hard","12.1 Ecosystem–Structure and Function","Stratification",206,2,
"Species composition and stratification describe the same ecosystem feature.",
"Species composition concerns identity and number of species, whereas stratification concerns vertical distribution.","D",
"The assertion is false; the reason correctly distinguishes the two.")
add_ar("Medium","12.2 Productivity","NPP",207,3,
"NPP is lower than GPP when plant respiration is greater than zero.",
"NPP is calculated as GPP minus respiration losses.","A",
"The equation directly explains the relationship.")
add_ar("Hard","12.2 Productivity","Secondary productivity",207,3,
"Secondary productivity refers to biomass formation by consumers.",
"Consumers capture radiant energy directly through photosynthesis.","C",
"The assertion is true; consumers do not photosynthesise to obtain energy.")
add_ar("Hard","12.2 Productivity","Ocean productivity",207,3,
"Oceans contribute less annual NPP than land despite occupying a larger surface area.",
"The chapter reports ocean NPP as 55 billion tonnes out of a global total of 170 billion tonnes.","A",
"The stated figures support and explain the assertion.")
add_ar("Medium","12.3 Decomposition","Humus",208,4,
"Humus decomposes extremely slowly.",
"Humus is highly resistant to microbial action.","A",
"Resistance to microbial action explains its slow decomposition.")
add_ar("Hard","12.3 Decomposition","Leaching",207,3,
"Leaching always increases immediate nutrient availability to plants.",
"Leached nutrients may precipitate as unavailable salts in deeper soil horizons.","D",
"The assertion is false; the reason is true.")
add_ar("Medium","12.3 Decomposition","Climate",208,4,
"Warm and moist conditions generally favour decomposition.",
"Temperature and soil moisture regulate microbial activity.","A",
"Microbial regulation explains the climatic effect.")
add_ar("Hard","12.3 Decomposition","Detritus quality",208,4,
"Lignin-rich detritus generally decomposes faster than sugar-rich detritus.",
"Lignin is resistant, whereas water-soluble sugars are more readily decomposed.","D",
"The assertion is false and the reason correctly states why.")
add_ar("Medium","12.4 Energy Flow","PAR",209,5,
"Only a small fraction of incident solar energy is fixed by plants.",
"Less than half of incident radiation is PAR, and plants capture only 2–10% of PAR.","A",
"Both filters explain the small captured fraction.")
add_ar("Hard","12.4 Energy Flow","Food chains",210,6,
"Detritus and grazing food chains are completely independent in natural ecosystems.",
"Some DFC organisms are eaten by GFC animals, and omnivores connect pathways.","D",
"The assertion is false; natural connections form food webs.")
add_ar("Medium","12.4 Energy Flow","10% law",211,7,
"Energy available decreases at successive trophic levels.",
"Only about 10% of energy is transferred from one trophic level to the next.","A",
"The 10% law explains the decrease.")
add_ar("Hard","12.4 Energy Flow","Standing crop",211,7,
"Standing crop and productivity are interchangeable terms.",
"Standing crop is an amount present at a time, whereas productivity is a rate.","D",
"The assertion is false and the reason correctly distinguishes them.")
add_ar("Medium","12.5 Ecological Pyramids","Energy pyramid",213,9,
"A pyramid of energy is always upright.",
"Some energy is lost as heat at every trophic transfer.","A",
"Heat loss makes higher trophic levels contain less energy.")
add_ar("Hard","12.5 Ecological Pyramids","Biomass pyramid",213,9,
"An inverted biomass pyramid in the sea violates the second law of thermodynamics.",
"Biomass standing crop and energy flow are different ecological measures.","D",
"The assertion is false; energy still decreases even when standing biomass is inverted.")

# 86–100 Match the following
def add_match(difficulty, section, topic, page, pdf_page, left, right, options, answer, explanation):
    q = "Match Column I with Column II.\nColumn I:\n" + "\n".join([f"{i+1}. {x}" for i,x in enumerate(left)])
    q += "\nColumn II:\n" + "\n".join([f"{chr(97+i)}. {x}" for i,x in enumerate(right)])
    add("Match the Following",difficulty,section,topic,page,pdf_page,q,
        options[0],options[1],options[2],options[3],answer,explanation)

add_match("Medium","12.1 Ecosystem–Structure and Function","Pond components",206,2,
["Phytoplankton","Zooplankton","Fungi and bacteria","Water with dissolved substances"],
["Consumer","Producer","Decomposer","Abiotic component"],
["1-b, 2-a, 3-c, 4-d","1-a, 2-b, 3-d, 4-c","1-b, 2-c, 3-a, 4-d","1-d, 2-a, 3-c, 4-b"],"A",
"Phytoplankton are producers; zooplankton consumers; fungi/bacteria decomposers; water and dissolved substances abiotic.")
add_match("Medium","12.2 Productivity","Productivity terms",207,3,
["GPP","NPP","Respiration loss","Secondary productivity"],
["New organic matter formed by consumers","Total rate of organic matter production during photosynthesis","GPP − NPP","Biomass available to heterotrophs"],
["1-b, 2-d, 3-c, 4-a","1-d, 2-b, 3-a, 4-c","1-b, 2-a, 3-d, 4-c","1-c, 2-d, 3-b, 4-a"],"A",
"GPP is total photosynthetic production; NPP is available biomass; respiration equals GPP−NPP; secondary productivity is consumer biomass formation.")
add_match("Hard","12.3 Decomposition","Processes of decomposition",207,3,
["Fragmentation","Leaching","Catabolism","Mineralisation"],
["Microbial release of inorganic nutrients from humus","Detritivores reduce particle size","Soluble nutrients move into deeper soil","Microbial enzymes degrade detritus"],
["1-b, 2-c, 3-d, 4-a","1-c, 2-b, 3-a, 4-d","1-b, 2-d, 3-c, 4-a","1-d, 2-c, 3-b, 4-a"],"A",
"Each process matches its NCERT definition.")
add_match("Medium","12.3 Decomposition","Detritus quality and climate",208,4,
["High lignin and chitin","High nitrogen and soluble sugars","Warm and moist conditions","Low temperature and anaerobiosis"],
["Faster decomposition","Slower decomposition","Favours decomposition","Organic matter build-up"],
["1-b, 2-a, 3-c, 4-d","1-a, 2-b, 3-d, 4-c","1-b, 2-c, 3-a, 4-d","1-d, 2-a, 3-c, 4-b"],"A",
"Resistant compounds slow decomposition; labile nutrients speed it; warmth/moisture favour it; cold/anaerobiosis cause build-up.")
add_match("Medium","12.4 Energy Flow","Trophic roles",210,6,
["Producer","Primary consumer","Secondary consumer","Tertiary consumer"],
["First trophic level","Second trophic level","Third trophic level","Fourth trophic level"],
["1-a, 2-b, 3-c, 4-d","1-b, 2-c, 3-d, 4-a","1-d, 2-c, 3-b, 4-a","1-a, 2-c, 3-b, 4-d"],"A",
"Producer through tertiary consumer correspond to first through fourth trophic levels.")
add_match("Hard","12.4 Energy Flow","Examples of trophic levels",210,6,
["Phytoplankton","Zooplankton","Small fish feeding on zooplankton","Large predatory fish"],
["Primary consumer","Producer","Tertiary consumer","Secondary consumer"],
["1-b, 2-a, 3-d, 4-c","1-a, 2-b, 3-c, 4-d","1-b, 2-d, 3-a, 4-c","1-c, 2-a, 3-d, 4-b"],"A",
"The sequence represents producer, primary consumer, secondary consumer and tertiary consumer.")
add_match("Medium","12.4 Energy Flow","Food-chain terminology",209,5,
["Herbivore","Primary carnivore","Secondary carnivore","Saprotroph"],
["Feeds on primary carnivore","Feeds on producer","Degrades dead matter","Feeds on herbivore"],
["1-b, 2-d, 3-a, 4-c","1-d, 2-b, 3-c, 4-a","1-b, 2-a, 3-d, 4-c","1-c, 2-d, 3-a, 4-b"],"A",
"Herbivores eat producers; primary carnivores eat herbivores; secondary carnivores eat primary carnivores; saprotrophs decompose.")
add_match("Hard","12.4 Energy Flow","Energy calculations",211,7,
["Producer energy: 100,000 J","Primary consumer energy","Secondary consumer energy","Tertiary consumer energy"],
["100 J","10,000 J","1,000 J","100,000 J"],
["1-d, 2-b, 3-c, 4-a","1-b, 2-c, 3-a, 4-d","1-d, 2-c, 3-b, 4-a","1-c, 2-b, 3-a, 4-d"],"A",
"Applying the 10% law gives 100,000 → 10,000 → 1,000 → 100 J.")
add_match("Medium","12.5 Ecological Pyramids","Pyramid types",212,8,
["Pyramid of number","Pyramid of biomass","Pyramid of energy","Marine biomass pyramid"],
["Always upright","May be inverted in tree ecosystem","May be inverted in sea","Expressed as living mass"],
["1-b, 2-d, 3-a, 4-c","1-d, 2-b, 3-c, 4-a","1-b, 2-c, 3-d, 4-a","1-a, 2-d, 3-b, 4-c"],"A",
"Number pyramids may invert in tree ecosystems; biomass is living mass; energy is always upright; marine biomass is often inverted.")
add_match("Hard","12.5 Ecological Pyramids","Pyramid limitations",214,10,
["Same species at multiple trophic levels","Food web","Saprophytes","Simple food chain assumption"],
["Not accommodated","Assumed by the model","No place assigned","Creates difficulty in assigning one level"],
["1-d, 2-a, 3-c, 4-b","1-a, 2-d, 3-b, 4-c","1-d, 2-c, 3-b, 4-a","1-c, 2-b, 3-a, 4-d"],"A",
"These are the stated limitations of ecological pyramids.")
add_match("Medium","12.1 Ecosystem–Structure and Function","Structural and functional features",206,2,
["Species composition","Stratification","Productivity","Nutrient cycling"],
["Vertical distribution","Species identification and enumeration","Storage and movement of nutrients","Rate of biomass production"],
["1-b, 2-a, 3-d, 4-c","1-a, 2-b, 3-c, 4-d","1-b, 2-d, 3-a, 4-c","1-c, 2-a, 3-d, 4-b"],"A",
"Each term matches its definition in the chapter.")
add_match("Hard","12.3 Decomposition","Products and properties",208,4,
["Humification","Humus","Mineralisation","Anaerobiosis"],
["Inorganic nutrient release","Dark amorphous nutrient reservoir","Humus formation","Inhibits decomposition"],
["1-c, 2-b, 3-a, 4-d","1-b, 2-c, 3-d, 4-a","1-c, 2-a, 3-b, 4-d","1-d, 2-b, 3-a, 4-c"],"A",
"Humification forms humus; humus is a dark nutrient reservoir; mineralisation releases inorganic nutrients; anaerobiosis inhibits decomposition.")
add_match("Medium","12.4 Energy Flow","Aquatic versus terrestrial pathways",210,6,
["Aquatic ecosystem","Terrestrial ecosystem","Detritus food chain","Food web"],
["Larger fraction through DFC","Major energy flow through GFC","Begins with dead organic matter","Interconnected food chains"],
["1-b, 2-a, 3-c, 4-d","1-a, 2-b, 3-d, 4-c","1-b, 2-c, 3-a, 4-d","1-d, 2-a, 3-c, 4-b"],"A",
"These matches reproduce the chapter’s comparison and definitions.")
add_match("Hard","12.5 Ecological Pyramids","Diagram interpretation",212,8,
["Grassland numbers pyramid","Terrestrial biomass pyramid","Aquatic biomass pyramid","Energy pyramid"],
["Can be inverted because producer standing crop is small","Shows decreasing dry weight at higher levels","Always upright","Many producers support few top carnivores"],
["1-d, 2-b, 3-a, 4-c","1-b, 2-d, 3-c, 4-a","1-d, 2-a, 3-b, 4-c","1-c, 2-b, 3-a, 4-d"],"A",
"The options correspond to the diagrams and discussion on pages 212–213.")
add_match("Hard","12.4 Energy Flow","Energy-source hierarchy",209,5,
["Incident solar radiation","PAR","Energy captured by plants","NPP available to heterotrophs"],
["2–10% of PAR","Less than 50% of incident radiation","GPP minus respiration","Total incoming sunlight"],
["1-d, 2-b, 3-a, 4-c","1-b, 2-d, 3-c, 4-a","1-d, 2-a, 3-b, 4-c","1-c, 2-b, 3-a, 4-d"],"A",
"Incoming sunlight contains less than 50% PAR; plants capture 2–10% of PAR; NPP is GPP minus respiration.")

assert len(questions) >= 100, len(questions)
import json
print(json.dumps(questions))
