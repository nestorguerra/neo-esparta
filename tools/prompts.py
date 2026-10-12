# Prompts para GPT Image: fichas de personaje + 51 viñetas (portada incluida).
STYLE = (
    "Hand-drawn graphic novel art in the style of Frank Miller's 300 fused with Blade Runner (1982): bold black ink brushwork, "
    "heavy chiaroscuro and crushed blacks, gritty ink splatter and film-grain texture, a limited palette of bronze, burnt orange "
    "and sepia with blood-red capes and electric cyan and magenta neon accents, cinematic lighting and dramatic perspective. "
    "It must look like a painted comic-book page panel, not a photo and not a 3D render. "
    "No text, no letters, no logos, no speech balloons, no captions, no panel borders, no watermark."
)
NESTOR = (
    "NÉSTOR: a man in his mid-forties, broad and strong, with a full thick dark-brown beard streaked with grey, wavy swept-back "
    "dark hair with grey at the temples, strong brows and warm brown eyes (his face must match the reference). Futuristic Spartan "
    "armor: black armored bodysuit, sculpted bronze muscle cuirass with a small glowing cyan lambda on the chest, bronze pauldrons "
    "and greaves, bare muscular upper arms, bronze vambraces with a small cyan holographic display on the left wrist, a braided "
    "red-and-black belt, black leather pteruges, a long blood-red cape. Weapons: a long spear with a glowing cyan plasma blade and "
    "a big round bronze aspis shield painted with a dark red lambda and a thin cyan energy rim."
)
LEO = (
    "LEO: his 11-year-old son, slim and agile, with thick wavy shoulder-length brown hair with lighter sun-bleached strands, "
    "parted in the middle, dark eyebrows, brown eyes, light olive skin (his face must match the reference). Futuristic suit: fitted "
    "matte black armored bodysuit with thin glowing cyan lines, a small bronze chest emblem, a short blood-red cape and scarf, "
    "black gauntlets with cyan rings, black boots with white soles. Weapon: a round bronze throwing disc with concentric glowing "
    "cyan rings."
)
MON = {
    "crawler": "CRAWLERS: six-legged insect-like monsters from a lightless dimension, black-purple carapace with bone spikes, clusters of glowing magenta eyes, fanged jaws.",
    "flyer": "FLYERS: bat-winged monsters with membranous purple wings, bony tails and glowing magenta eyes.",
    "colossus": "THE COLOSSUS: a 25-meter tentacled titan of black-purple flesh and bone plates, a crown of bone horns, a single huge burning yellow eye with a slit pupil, a glowing magenta maw full of fangs.",
}
CITY = "Setting: NEO-ESPARTA in 2099, a rain-soaked megacity of black skyscrapers, abstract cyan and magenta neon signs, flying cars, flame-topped stacks."
SAFE = {
    "wide": "Ultra-wide cinematic framing: the image will be cropped to a thin horizontal strip, so keep every important subject inside the middle 50% horizontal band.",
    "strip": "Extreme letterbox framing: the image will be cropped to a very thin horizontal strip, so keep every important subject inside the middle 40% horizontal band.",
}

def size_for(ar):
    if ar >= 1.2: return "1536x1024"
    if ar <= 0.8: return "1024x1536"
    return "1024x1024"

# id, aspect (cols/rows), personajes, monstruos, escena
PANELS = [
    ("cover", 0.75, "NL", [], "Comic book cover, vertical. Low heroic angle: NÉSTOR and LEO stand side by side on a rain-swept skyscraper rooftop, Néstor with his spear planted upright and shield forward, Leo in a fighting stance holding his glowing disc, both red capes whipping in the wind. Behind and above them a huge magenta dimensional rift tears the burning bronze storm sky, lightning crackling, winged monsters falling from it, neon skyline all around. Keep the top third of the image as open dramatic sky (the title will go there). Characters full body in the lower half."),
    ("1-1", 2.4, "", [], "Establishing shot at night in pouring rain: endless black skyscrapers with neon, a colossal pyramid and flame-topped stacks on the horizon, flying cars. The bronze-orange storm sky is ripped open by a giant vertical magenta dimensional rift. In the foreground, on the edge of a rooftop, two tiny silhouettes with red capes seen from behind: a broad warrior with spear and round shield, and a boy."),
    ("1-2", 1.33, "N", [], "Extreme close-up of NÉSTOR's face in the rain, three-quarter view, looking up at the sky with grim determination, rain drops in his grey-streaked beard; magenta light from the rift rims one side of his face, warm bronze light the other. Blurred neon city behind."),
    ("1-3", 1.33, "L", [], "Medium close-up of LEO on a rooftop at night in the rain, tightening the gauntlet on his left wrist with his right hand, cyan sparks crackling from the gauntlet, wet hair over his forehead, the bronze disc strapped on his back, a confident half-smile. Blurred neon skyscrapers behind."),
    ("1-4", 0.67, "N", [], "Vertical low-angle shot from behind NÉSTOR (small, lower foreground, red cape, spear upright, shield on his arm) looking up at a giant magenta dimensional rift in the storm sky; an enormous black monster hand with bone talons pushes out through the tear amid lightning."),
    ("1-5", 2.67, "N", [], "Medium-wide shot: NÉSTOR at the edge of a rooftop in a classic Spartan stance, three-quarter view, spear planted upright in his right hand, round bronze shield on his left arm, long red cape snapping in the storm wind, stern face. Rain and embers. Place him in the left third; the right side is the stormy neon city."),
    ("1-6", 1.5, "", ["flyer"], "High-angle wide shot over the city: dozens of winged monsters plunge from the rift like meteors leaving magenta streaks and crash onto skyscraper rooftops in bursts of fire and debris. Rain, smoke, neon."),
    ("1-7", 1.5, "NL", [], "Back view: NÉSTOR and LEO stand side by side at the very edge of a rooftop, backs to the camera, red capes blowing, looking down at the burning neon city and the rift in the sky. Néstor holds his spear upright, Leo has his disc on his back. Night rain."),
    ("1-8", 2.4, "NL", ["flyer"], "Splash panel seen over their shoulders from the rooftop edge: NÉSTOR and LEO leap off the skyscraper into the void, diving toward the burning city far below, capes streaming upward, Néstor's spear forward and shield ready, Leo holding his glowing disc. Vertigo perspective down the tower, falling monsters and fires below, rain streaks."),
    ("2-1", 1.75, "NL", [], "Low-angle medium shot on a rainy neon street in a futuristic canal district: NÉSTOR lands in a superhero landing, one knee and one fist slamming the asphalt, which cracks in a star pattern; a shockwave ring blasts water and debris outward. LEO lands crouched beside him. Neon reflections on the wet ground, tall narrow canal houses behind."),
    ("2-2", 1.25, "", ["crawler"], "Ground-level shot down a rainy neon street beside a canal: a pack of crawler monsters charges straight at the camera, jaws open, magenta eyes glowing, splashing through puddles. Canal houses and neon on both sides."),
    ("2-3", 1.0, "N", ["crawler"], "Over-the-shoulder shot behind NÉSTOR: he braces his feet and raises his round shield, which projects a huge curved wall of glowing cyan hexagonal energy in front of him; crawler monsters gallop toward the wall down the rainy neon street."),
    ("2-4", 1.0, "N", ["crawler"], "Side view impact: a crawler monster slams head-first into NÉSTOR's curved cyan hexagonal energy wall; explosion of cyan sparks, the hexagons ripple; Néstor stands firm and braced behind it. Rain and neon."),
    ("2-5", 0.57, "NL", ["crawler"], "Vertical low-angle shot: LEO vaults off his father's shoulder and flies over the cyan hexagonal energy wall, horizontal in mid-air, hair flying, glowing disc in hand; below him NÉSTOR is braced behind his shield; crawlers beyond the wall. Rain, neon sky."),
    ("2-6", 2.67, "L", ["crawler"], "Wide shot down the rainy neon street: LEO, just after a backhand throw, watches his glowing disc ricochet between three crawler monsters, the disc leaving a bright cyan zigzag trail with magenta sparks at each impact."),
    ("2-7", 1.0, "L", [], "Medium shot facing LEO: he catches the returning glowing disc above his head with one hand without even looking, cocky half-smile; behind him defeated monsters smoke on the wet neon street."),
    ("2-8", 2.0, "N", ["crawler"], "Low side shot: a crawler monster leaps at NÉSTOR and he skewers it in mid-air with a precise thrust of his plasma spear, a burst of magenta energy at the spear tip (no gore); Néstor stays calm. Rain and neon."),
    ("2-9", 1.4, "", [], "Wide shot from the canal at water level: crowds of fleeing civilians with glowing LED umbrellas cross an arched stone bridge over the canal in the rain; tall neon-lit canal houses and pink neon above them."),
    ("2-10", 1.0, "NL", ["crawler"], "High three-quarter angle: NÉSTOR and LEO stand back to back in the middle of a wet neon street, surrounded by a tight circle of eight crawler monsters; Néstor with spear and shield, Leo with his disc raised; the same determined expression on both faces."),
    ("3-1", 2.4, "NL", ["colossus"], "The canal explodes: THE COLOSSUS rises twenty meters out of the water between neon canal houses, tentacles like towers, water cascading off it. NÉSTOR and LEO, tiny, stand on the quay in the foreground seen from behind. Rain, neon."),
    ("3-2", 0.57, "", ["colossus"], "Extreme low-angle vertical shot from street level: THE COLOSSUS towers over the narrow canal street, blotting out the storm sky, its single yellow eye glaring down, tentacles curling; the neon signs only reach its ankles."),
    ("3-3", 2.0, "L", ["colossus"], "Mid-air shot: a huge tentacle of THE COLOSSUS has grabbed LEO around the waist and lifts him high above the canal; Leo struggles and shouts; behind him the Colossus's giant yellow eye watches. Rain, neon city below."),
    ("3-4", 1.0, "N", [], "Close-up of NÉSTOR's face from a low angle, rain streaming down, jaw clenched, eyes burning with cold fury, magenta monster light on his face."),
    ("3-5", 0.83, "N", ["colossus"], "Low side angle: NÉSTOR roars with his arms spread wide and mouth open; visible concentric rings of sonic force blast from his mouth across the street toward the Colossus, shattering the glass of the neon windows, shards flying, cape whipping."),
    ("3-6", 2.33, "L", ["colossus"], "Wide aerial shot: the tentacle that held LEO disintegrates into fragments and magenta dust; LEO falls through the rain with arms spread; the Colossus recoils in the background."),
    ("3-7", 1.0, "NL", ["colossus"], "Mid-air medium shot: NÉSTOR leaps and catches LEO in his arms mid-fall, one arm under his knees and one behind his back, their red capes tangling, rain and motion streaks, the Colossus behind."),
    ("3-8", 2.33, "NL", [], "Medium two-shot on the wet neon street: NÉSTOR rests his hand on LEO's shoulder; Leo stands with arms crossed pretending he wasn't scared, a small smirk; Néstor with a faint proud smile. Rain easing."),
    ("3-9", 3.5, "", ["colossus"], "Shot just above the dark canal water: the water is calm again, but right at the surface, between foam and ripples, a single enormous burning yellow eye opens. Neon reflections on the water."),
    ("4-1", 2.0, "NL", [], "Wide dynamic shot: a futuristic hover-bike races through a canyon of skyscrapers covered in vertical neon signs, NÉSTOR piloting and LEO riding behind holding on, capes streaming back, cyan thruster trails, flying traffic, horizontal rain streaks, motion blur."),
    ("4-2", 1.0, "N", [], "Close-up: NÉSTOR on the hover-bike raises his left forearm; the cyan display on his wrist projects a floating hologram map of a circular stadium with a pulsing magenta target; his face lit cyan behind the hologram."),
    ("4-3", 1.0, "L", [], "Close-up of LEO riding behind his father on the hover-bike, hair whipping in the wind, eyes lighting up with excitement, grinning. Neon streaks behind."),
    ("4-4", 2.0, "", ["flyer"], "Rear view from the back of a speeding hover-bike: a flock of flyer monsters with glowing magenta eyes chases it between neon skyscrapers, wings spread, closing in."),
    ("4-5", 1.75, "NL", ["flyer"], "Side view: LEO stands up on the seat of the speeding hover-bike facing backwards and throws his glowing disc with a perfect backhand at the pursuing flyer monsters; NÉSTOR pilots in front. Neon canyon, speed streaks."),
    ("4-6", 1.25, "", ["flyer"], "Medium shot: a glowing bronze-and-cyan disc slices through a flyer monster, which bursts into shards and magenta light; another flyer barely dodges. Neon canyon background."),
    ("4-7", 3.0, "", [], "Aerial shot at night: the Central Stadium, a colossal ring-shaped arena among skyscrapers, with a pillar of magenta light rising from the center of the pitch up to a rift in the sky; a tiny cyan streak (a hover-bike) approaches. Rain, neon."),
    ("4-8", 1.25, "NL", ["crawler"], "Low reverse shot from the pitch: the stadium's red stands are packed with thousands of silhouetted monsters with glowing magenta eyes staring in silence; NÉSTOR and LEO, small, seen from behind on the grass in the foreground."),
    ("4-9", 3.5, "NL", [], "Medium two-shot in profile on the stadium pitch: NÉSTOR turns to LEO and speaks seriously; Leo looks up at him and answers. Stands full of glowing eyes blurred behind."),
    ("4-10", 3.5, "NL", [], "Close two-shot: NÉSTOR with a sly half-smile, LEO rolling his eyes and smiling. Stadium floodlights and magenta glow behind."),
    ("4-11", 2.4, "NL", ["crawler"], "Epic shot from behind NÉSTOR: he stands alone on the stadium pitch facing a tidal wave of hundreds of crawler monsters pouring down from the stands; shield forward, spear raised over his shoulder, red cape blazing against the magenta glow of a huge energy sphere at the center of the pitch. LEO waits a few meters to the side, ready."),
    ("5-1", 1.75, "N", ["crawler"], "Side tracking shot: NÉSTOR charges into the horde shield-first, crawler monsters flying through the air from the impact, chunks of turf and sparks everywhere, his cape torn and streaming."),
    ("5-2", 1.25, "L", ["crawler", "flyer"], "Front shot: LEO sprints along the touchline of the stadium pitch dodging claws, a flyer monster swooping down at him and crawlers lunging from the side; he does not slow down."),
    ("5-3", 1.0, "", [], "Low angle: THE CORE, a giant sphere of living magenta energy, floats above the center circle of a stadium pitch, connected to the stormy sky by a column of light; lightning arcs lick the grass."),
    ("5-4", 2.0, "L", ["colossus"], "Wide shot from behind LEO (small, in the foreground): THE COLOSSUS bursts up from the stadium pitch behind a floating sphere of magenta energy, blocking the way like a giant goalkeeper, tentacles spread, yellow eye glaring."),
    ("5-5", 2.25, "N", ["colossus"], "Three-quarter rear shot: NÉSTOR hurls his spear with his whole body like Leonidas, the spear flying across the stadium with a cyan trail straight toward the Colossus's yellow eye."),
    ("5-6", 0.75, "", ["colossus"], "Vertical close-up: a cyan plasma spear plunges into the Colossus's giant yellow eye; an explosion of fire and light (no gore); the titan recoils with its jaws open."),
    ("5-7", 1.25, "L", [], "Side profile medium shot: LEO in a low martial-arts lunge, one arm raised and the other extended forward; in front of his fist his disc spins and turns into a blazing ball of cyan plasma with energy rings around it. Stadium at night behind."),
    ("5-8", 1.75, "L", [], "Low dynamic close shot: LEO's volley kick, his foot striking a cyan plasma ball full on, energy rings exploding outward, turf flying up."),
    ("5-9", 3.0, "", ["colossus"], "Aerial shot: a plasma ball pierces a sphere of magenta energy at the center of the stadium, which explodes into a dome of white-pink light swelling over the arena; shockwaves sweep the stands; the Colossus's silhouette disintegrates."),
    ("5-10", 1.0, "", [], "Upward shot from a stadium pitch through the open ring of the roof: a magenta dimensional rift in the sky collapses on itself into a thin line, imploding rings of light."),
    ("5-11", 1.75, "NL", [], "Dawn, back view: NÉSTOR and LEO sit on the edge of their skyscraper rooftop, legs dangling, Néstor's arm around Leo's shoulders, looking at the sunrise over the smoking city skyline, golden bronze sun, long silhouettes. Peaceful and warm."),
    ("5-12", 3.0, "NL", [], "Shot from the ground looking up past a huge stadium wall: the morning sky still bears a thin scar, and inside it a gigantic eye slowly opens in the clouds. NÉSTOR and LEO, small, look up at it. Ominous."),
]

CLOSE = {"1-2", "3-4", "4-2", "1-3", "2-7", "4-3", "5-7", "4-10"}

def refs_for(pid, who):
    r = []
    if "N" in who: r.append("sheets/nestor_sheet.png")
    if "L" in who: r.append("sheets/leo_sheet.png")
    if pid in CLOSE:
        if "N" in who: r += ["ref/nestor_face_1.jpg", "ref/nestor_face_2.jpg"]
        if "L" in who: r += ["ref/leo_face_1.jpg", "ref/leo_face_2.jpg"]
    if not r: r = ["sheets/style.png"]
    return r

def panel_prompt(pid, ar, who, mons, scene):
    parts = []
    roles = []
    for i, rp in enumerate(refs_for(pid, who), 1):
        if "nestor_sheet" in rp: roles.append(f"Reference image {i} is the character sheet of NÉSTOR")
        elif "leo_sheet" in rp: roles.append(f"reference image {i} is the character sheet of LEO")
        elif "nestor_face" in rp: roles.append(f"reference image {i} is a photo of Néstor's real face")
        elif "leo_face" in rp: roles.append(f"reference image {i} is a photo of Leo's real face")
        elif "style" in rp: roles.append(f"Reference image {i} only shows the art style to match (do not copy its composition)")
    if roles: parts.append("; ".join(roles) + ". Keep faces, hair, beard and costumes exactly consistent with the references.")
    parts.append("Comic panel: " + scene)
    if "N" in who: parts.append(NESTOR)
    if "L" in who: parts.append(LEO)
    for m in mons: parts.append(MON[m])
    parts.append(CITY)
    if ar >= 3.0: parts.append(SAFE["strip"])
    elif ar >= 2.0: parts.append(SAFE["wide"])
    parts.append(STYLE)
    return " ".join(parts)

SHEETS = [
    ("nestor_sheet", "1536x1024", ["ref/nestor_face_1.jpg", "ref/nestor_face_2.jpg", "ref/nestor_3.jpg", "ref/nestor_4.jpg"],
     "Character model sheet for a graphic novel, based on the real man in the reference photos (keep his face clearly recognizable: "
     "the same face shape, nose, eyes, beard and hairline). Show the SAME character four times on a plain dark sepia paper background: "
     "a large head-and-shoulders portrait on the left, then full-body front view, three-quarter view and back view. " + NESTOR + " " + STYLE),
    ("leo_sheet", "1536x1024", ["ref/leo_face_1.jpg", "ref/leo_face_2.jpg", "ref/leo_1.jpg", "ref/leo_2.jpg"],
     "Character model sheet for a graphic novel, based on the real boy in the reference photos (keep his face clearly recognizable: "
     "the same face shape, nose, eyes, eyebrows and hair). Show the SAME character four times on a plain dark sepia paper background: "
     "a large head-and-shoulders portrait on the left, then full-body front view, three-quarter view and back view. " + LEO + " " + STYLE),
    ("style", "1536x1024", [],
     "Comic panel: a rain-soaked futuristic megacity street at night, black skyscrapers with abstract neon signs, a bronze storm sky "
     "torn by a glowing magenta rift, a crawler monster in silhouette. " + MON["crawler"] + " " + STYLE),
]

def jobs():
    out = []
    for sid, size, refs, prompt in SHEETS:
        out.append({"id": sid, "dir": "sheets", "size": size, "refs": refs, "prompt": prompt})
    for pid, ar, who, mons, scene in PANELS:
        out.append({"id": pid, "dir": "panels", "size": size_for(ar), "refs": refs_for(pid, who), "prompt": panel_prompt(pid, ar, who, mons, scene), "ar": ar})
    return out
