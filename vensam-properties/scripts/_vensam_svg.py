"""Rebuild vensam-logo.svg complete (leaf, letter counters A/P/R, Y, final A)."""
import re, os, vtracer
from PIL import Image

SRC = r"public\media\vensam.jpeg"
TMP = os.path.join(os.environ["TEMP"], "vensam_rgba.png")
OUT = r"public\media\vensam-logo.svg"
BLUE = (22, 93, 171)

# High-res master so thin strokes (leaf, Y, R leg) survive the trace.
full = Image.open(SRC).convert("L")
w = 1280
im = full.resize((w, round(full.height * w / full.width)), Image.LANCZOS)
ink = im.point(lambda v: 255 if v < 175 else 0)

# RGBA: blue ink, everything else (incl. letter counters) transparent —
# counters become holes in the traced paths, no white paint, true transparency.
rgba = Image.new("RGBA", im.size, (0, 0, 0, 0))
rgba.paste(BLUE + (255,), (0, 0), ink)
rgba.save(TMP)

vtracer.convert_image_to_svg_py(
    TMP, OUT,
    colormode="color",
    hierarchical="stacked",
    mode="spline",
    filter_speckle=2,
    color_precision=8,
    layer_difference=12,
    corner_threshold=60,
    length_threshold=3.0,
    splice_threshold=45,
    max_iterations=12,
    path_precision=2,
)

svg = open(OUT, encoding="utf-8").read()
head = svg.partition("<path")[0].strip()
if "viewBox" not in head:
    head = head.replace("<svg", f'<svg viewBox="0 0 {im.width} {im.height}"', 1)

paths = re.findall(r"<path[^>]*/>", svg)
# unify ink to brand blue; drop any leftover near-white/transparent-swatch paths
def keep(p: str) -> bool:
    m = re.search(r'fill="(#[0-9a-fA-F]{6})"', p)
    if not m:
        return True
    v = m.group(1)
    r, g, b = int(v[1:3], 16), int(v[3:5], 16), int(v[5:7], 16)
    return not (r >= 250 and g >= 250 and b >= 250)

kept = [re.sub(r'fill="#[0-9A-Fa-f]{6}"', 'fill="#165DAB"', p)
        for p in paths if keep(p)]
out = head + "\n" + "\n".join(kept) + "\n</svg>\n"
out = re.sub(r"(-?\d+\.\d{2})\d+", r"\1", out)  # 2 decimals: crisp curves
open(OUT, "w", encoding="utf-8").write(out)
print(f"paths {len(paths)} kept {len(kept)} bytes {len(out)}")
<
