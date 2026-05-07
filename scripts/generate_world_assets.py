from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
import math

OUT = Path("public/world-assets")
OUT.mkdir(parents=True, exist_ok=True)

INK = (32, 35, 40)
MUTED = (108, 116, 124)
PAPER = (251, 247, 239)
PAPER_STRONG = (255, 253, 248)
GREEN = (31, 86, 70)
GREEN_DARK = (23, 49, 47)
GREEN_MID = (54, 116, 91)
GOLD = (190, 136, 28)
CORAL = (255, 72, 57)
BLUE = (64, 111, 235)
LINE = (226, 216, 202)


def font(size, bold=False):
    candidates = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def rounded(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def gradient(size, top, bottom):
    w, h = size
    img = Image.new("RGB", size, top)
    pix = img.load()
    for y in range(h):
        t = y / max(h - 1, 1)
        col = tuple(int(top[i] * (1 - t) + bottom[i] * t) for i in range(3))
        for x in range(w):
            pix[x, y] = col
    return img


def wrap_text(draw, text, fnt, max_width):
    words = text.split()
    lines = []
    line = ""
    for word in words:
        test = word if not line else f"{line} {word}"
        if draw.textbbox((0, 0), test, font=fnt)[2] <= max_width:
            line = test
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def draw_logo(draw, cx, cy, r, scale=1.0):
    shadow = Image.new("RGBA", (int(r * 3), int(r * 3)), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.ellipse((r * 0.25, r * 0.25, r * 2.75, r * 2.75), fill=(0, 0, 0, 80))
    shadow = shadow.filter(ImageFilter.GaussianBlur(int(r * 0.18)))
    # Draw mark directly on caller.
    draw.rounded_rectangle((cx - r, cy - r, cx + r, cy + r), radius=int(r * 0.38), fill=(30, 104, 82))
    draw.ellipse((cx - r * 0.94, cy - r * 0.94, cx + r * 0.94, cy + r * 0.94), outline=(255, 248, 221), width=max(3, int(5 * scale)))
    draw.arc((cx - r * 0.72, cy - r * 0.72, cx + r * 0.72, cy + r * 0.72), 205, 520, fill=(255, 248, 221), width=max(2, int(4 * scale)))
    draw.line((cx - r * 0.78, cy + r * 0.08, cx + r * 0.88, cy - r * 0.22), fill=GOLD, width=max(4, int(7 * scale)))
    draw.ellipse((cx - r * 0.16, cy - r * 0.16, cx + r * 0.16, cy + r * 0.16), fill=GOLD)
    for px, py in [(-0.72, 0.24), (0.76, -0.34), (0.92, -0.22)]:
        draw.ellipse((cx + px * r - r * 0.09, cy + py * r - r * 0.09, cx + px * r + r * 0.09, cy + py * r + r * 0.09), fill=(255, 253, 248))
    draw.text((cx - r * 0.03, cy - r * 0.12), "H", fill=(255, 253, 248), font=font(int(r * 0.86), True), anchor="mm")


def draw_phone_chrome(draw, w, h, active="Home"):
    nav_h = 122
    rounded(draw, (22, 22, w - 22, h - 22), 46, PAPER, outline=LINE, width=2)
    draw.rectangle((24, h - nav_h - 22, w - 24, h - 24), fill=(252, 248, 241))
    items = [("⌂", "Home"), ("?", "Ask"), ("✧", "Chains"), ("⌑", "Market"), ("▭", "Stories"), ("○", "Me")]
    step = (w - 70) / len(items)
    for i, (icon, label) in enumerate(items):
        x = 42 + step * i
        if label == active:
            rounded(draw, (x - 18, h - nav_h + 8, x + 88, h - 42), 22, (238, 231, 220))
        draw.text((x + 35, h - nav_h + 35), icon, fill=GREEN_DARK, font=font(26, True), anchor="mm")
        draw.text((x + 35, h - nav_h + 70), label, fill=(82, 87, 82), font=font(18), anchor="mm")


def app_icon():
    s = 1024
    img = gradient((s, s), GREEN_DARK, GREEN_MID).convert("RGBA")
    d = ImageDraw.Draw(img)
    for r, alpha in [(660, 32), (420, 42), (240, 38)]:
        d.ellipse((s - r * 0.8, -r * 0.25, s + r * 0.35, r * 0.9), outline=(255, 253, 248, alpha), width=4)
    for i in range(-220, 820, 58):
        d.line((i, s + 80, i + 360, s - 280), fill=(255, 253, 248, 18), width=13)
    draw_logo(d, s // 2, s // 2, 318, 4)
    img.save(OUT / "humanchain-profile-icon-1024.png")


def content_card():
    w, h = 1035, 720
    img = gradient((w, h), GREEN_DARK, GREEN_MID).convert("RGBA")
    d = ImageDraw.Draw(img)
    for r in [460, 300]:
        d.ellipse((w - r, -r // 2, w + r // 4, r), outline=(255, 253, 248, 42), width=3)
    for x in range(-120, 330, 40):
        d.line((x, h, x + 280, h - 280), fill=(255, 253, 248, 24), width=15)
    draw_logo(d, 132, 124, 58, 1.0)
    d.text((218, 88), "Verified human network", fill=(232, 226, 214), font=font(32, True))
    d.text((218, 130), "HumanChain", fill=(255, 253, 248), font=font(44, True))
    d.text((64, 250), "Ask people, not algorithms.", fill=(255, 253, 248), font=font(72, True))
    copy = "Real questions, human stories, nearby trade, and simple bids inside World App."
    y = 348
    for line in wrap_text(d, copy, font(38), 760):
        d.text((64, y), line, fill=(255, 253, 248), font=font(38))
        y += 52
    # Required foreground blur/quiet zone at bottom 94px.
    overlay = Image.new("RGBA", (w, 282), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.rounded_rectangle((0, 0, w, 282), radius=88, fill=(20, 34, 35, 190))
    overlay = overlay.filter(ImageFilter.GaussianBlur(28))
    img.alpha_composite(overlay, (0, h - 240))
    img.save(OUT / "humanchain-tag-content-card-1035x720.png")


def showcase_home():
    w, h = 1080, 1920
    img = Image.new("RGB", (w, h), (246, 240, 231))
    d = ImageDraw.Draw(img)
    draw_phone_chrome(d, w, h, "Home")
    x0, y0, x1 = 46, 70, w - 46
    rounded(d, (x0, y0, x1, 650), 60, GREEN_DARK)
    d.ellipse((760, -90, 1120, 270), outline=(255, 253, 248, 58), width=3)
    draw_logo(d, 142, 160, 62)
    d.text((236, 120), "Verified human network", fill=(227, 221, 211), font=font(30, True))
    d.text((236, 166), "HumanChain", fill=(255, 253, 248), font=font(42, True))
    d.text((78, 270), "Where real humans\ncarry wisdom forward.", fill=(255, 253, 248), font=font(74, True), spacing=8)
    copy = "Ask real people, read human stories, save field wisdom, trade with nearby humans, and build a visible chain of purpose."
    y = 440
    for line in wrap_text(d, copy, font(35), 840):
        d.text((78, y), line, fill=(255, 253, 248), font=font(35))
        y += 50
    chips = ["Daily human question", "Story vault", "Nearby marketplace", "Human points"]
    for i, chip in enumerate(chips):
        cx = 78 + (i % 2) * 465
        cy = 690 + (i // 2) * 86
        rounded(d, (cx, cy, cx + 420, cy + 62), 26, (76, 127, 104), outline=(132, 170, 151), width=2)
        d.text((cx + 28, cy + 18), chip, fill=(255, 253, 248), font=font(27, True))
    cards = [("Ask The\nWorld", "Real answers\nfrom verified\nhumans"), ("Join Today's\nChain", "Add one link to\nthe world"), ("Human\nMarket", "Buy, sell, and\npromote nearby"), ("Story Vault", "Monthly stories\nfrom real people")]
    for i, (title, text) in enumerate(cards):
        cx = 34 + (i % 3) * 342
        cy = 930 + (i // 3) * 360
        rounded(d, (cx, cy, cx + 304, cy + 320), 28, PAPER_STRONG, outline=LINE, width=2)
        d.text((cx + 32, cy + 82), title, fill=INK, font=font(36, True), spacing=4)
        d.text((cx + 32, cy + 194), text, fill=(120, 119, 111), font=font(29), spacing=6)
    img.save(OUT / "humanchain-showcase-1-home-1080x1920.png")


def showcase_ask():
    w, h = 1080, 1920
    img = Image.new("RGB", (w, h), (246, 240, 231))
    d = ImageDraw.Draw(img)
    draw_phone_chrome(d, w, h, "Ask")
    rounded(d, (42, 64, w - 42, 360), 46, (76, 104, 159))
    d.text((84, 86), "Ask people, not algorithms.", fill=(255, 253, 248), font=font(60, True))
    d.text((84, 166), "Publish one honest question and watch real answers form into a living verdict.", fill=(232, 236, 245), font=font(36), spacing=5)
    rounded(d, (42, 402, w - 42, 1260), 40, PAPER_STRONG, outline=LINE, width=2)
    d.text((84, 462), "What do you want to ask humanity?", fill=INK, font=font(38, True))
    rounded(d, (84, 538, w - 84, 820), 32, (255, 252, 246), outline=LINE, width=2)
    d.text((120, 590), "Example: Should I leave my job and start\nmy own business?", fill=(126, 126, 123), font=font(34), spacing=10)
    modes = [("Text", "Public question", True), ("Voice", "Hear my tone", False), ("Private", "Hide identity", False), ("Deep Verdict", "Human report", False)]
    for i, (a, b, active) in enumerate(modes):
        cx = 84 + (i % 2) * 464
        cy = 870 + (i // 2) * 170
        rounded(d, (cx, cy, cx + 430, cy + 128), 26, GREEN if active else PAPER_STRONG, outline=LINE, width=2)
        d.text((cx + 28, cy + 28), a, fill=(255, 253, 248) if active else INK, font=font(35, True))
        d.text((cx + 28, cy + 78), b, fill=(232, 226, 214) if active else GOLD, font=font(26, True))
    topics = ["Life", "Love", "Money", "Business", "Family"]
    x = 84
    for i, t in enumerate(topics):
        tw = d.textbbox((0, 0), t, font=font(26))[2] + 52
        rounded(d, (x, 1092, x + tw, 1160), 34, GREEN if i == 0 else PAPER_STRONG, outline=LINE, width=2)
        d.text((x + tw / 2, 1126), t, fill=(255, 253, 248) if i == 0 else INK, font=font(26), anchor="mm")
        x += tw + 16
    rounded(d, (84, 1188, w - 84, 1292), 52, INK)
    d.text((w // 2, 1240), "Ask Verified Humans", fill=(255, 253, 248), font=font(39, True), anchor="mm")
    d.text((42, 1325), "Live Human Questions", fill=(102, 109, 101), font=font(32, True))
    for i in range(2):
        cy = 1385 + i * 175
        rounded(d, (42, cy, w - 42, cy + 138), 28, PAPER_STRONG, outline=LINE, width=2)
        d.text((84, cy + 32), ["Is discipline love for my future self?", "How do I repair trust after silence?"][i], fill=INK, font=font(30, True))
        d.text((84, cy + 84), ["18 answers forming", "42 humans joined"][i], fill=GOLD, font=font(24, True))
    img.save(OUT / "humanchain-showcase-2-ask-1080x1920.png")


def showcase_market():
    w, h = 1080, 1920
    img = Image.new("RGB", (w, h), (246, 240, 231))
    d = ImageDraw.Draw(img)
    draw_phone_chrome(d, w, h, "Market")
    rounded(d, (42, 60, w - 42, 430), 48, (30, 78, 91))
    d.text((84, 112), "HumanChain Market", fill=(232, 226, 214), font=font(30, True))
    d.text((84, 164), "Simple bids.\nReal nearby humans.", fill=(255, 253, 248), font=font(70, True), spacing=8)
    d.text((84, 330), "Buy, sell, and promote nearby with safe receipts.", fill=(234, 239, 237), font=font(34))
    rounded(d, (42, 470, w - 42, 605), 30, PAPER_STRONG, outline=LINE, width=2)
    d.text((88, 512), "Nearby market active", fill=INK, font=font(34, True))
    d.text((88, 558), "Westlands · Browser/manual location only", fill=MUTED, font=font(27))
    items = [("Samsung Galaxy A54", "22 WLD target", "Best 20 WLD", "Next bid 20.5 WLD", True), ("Canvas tote bags", "4 WLD target", "Best 3.5 WLD", "Next bid 4 WLD", True), ("Restaurant launch poster", "Sponsored", "Direct inbox", "Marketing link", False)]
    for i, (title, price, best, nextbid, bidding) in enumerate(items):
        cy = 650 + i * 300
        rounded(d, (42, cy, w - 42, cy + 260), 34, PAPER_STRONG, outline=LINE, width=2)
        rounded(d, (84, cy + 42, 198, cy + 156), 28, BLUE if i == 0 else GOLD if i == 1 else GREEN)
        d.text((226, cy + 42), title, fill=INK, font=font(34, True))
        d.text((226, cy + 88), price, fill=GOLD, font=font(28, True))
        d.text((226, cy + 130), best, fill=MUTED, font=font(26))
        if bidding:
            rounded(d, (226, cy + 178, 488, cy + 226), 24, (239, 245, 255), outline=(196, 211, 247), width=2)
            d.text((357, cy + 202), nextbid, fill=BLUE, font=font(24, True), anchor="mm")
            rounded(d, (w - 286, cy + 170, w - 84, cy + 232), 31, INK)
            d.text((w - 185, cy + 201), "Place bid", fill=PAPER_STRONG, font=font(25, True), anchor="mm")
        else:
            rounded(d, (226, cy + 178, 530, cy + 226), 24, (237, 247, 242), outline=(192, 221, 207), width=2)
            d.text((378, cy + 202), "Open seller chat", fill=GREEN, font=font(24, True), anchor="mm")
    img.save(OUT / "humanchain-showcase-3-market-1080x1920.png")


def meta_image():
    w, h = 1200, 630
    img = gradient((w, h), GREEN_DARK, GREEN_MID).convert("RGBA")
    d = ImageDraw.Draw(img)
    for r in [520, 340]:
        d.ellipse((w - r, -r // 2, w + r // 4, r), outline=(255, 253, 248, 42), width=3)
    draw_logo(d, 150, 140, 62)
    d.text((238, 102), "HumanChain", fill=(255, 253, 248), font=font(52, True))
    d.text((74, 245), "Ask real humans.\nGet the world's verdict.", fill=(255, 253, 248), font=font(76, True), spacing=10)
    d.text((76, 440), "Verified questions · human stories · nearby market · simple bids", fill=(237, 231, 220), font=font(34))
    rounded(d, (76, 510, 360, 572), 31, (255, 253, 248))
    d.text((218, 541), "Open HumanChain", fill=INK, font=font(28, True), anchor="mm")
    img.save(OUT / "humanchain-meta-image-1200x630.png")


if __name__ == "__main__":
    app_icon()
    content_card()
    showcase_home()
    showcase_ask()
    showcase_market()
    meta_image()
    print("Generated HumanChain World Developer Portal assets:")
    for path in sorted(OUT.glob("*.png")):
        print(path)
