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
    if h <= 1200:
        return
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
    w, h = 345, 240
    img = gradient((w, h), GREEN_DARK, GREEN_MID).convert("RGBA")
    d = ImageDraw.Draw(img)
    draw_logo(d, 48, 45, 26, 0.46)
    d.text((88, 28), "HumanChain", fill=(255, 253, 248), font=font(25, True))
    d.text((22, 88), "Ask real humans.", fill=(255, 253, 248), font=font(30, True))
    d.text((22, 122), "Get the world's verdict.", fill=(255, 253, 248), font=font(25, True))
    copy = "Questions · stories · nearby market · simple bids"
    y = 158
    for line in wrap_text(d, copy, font(17), 286):
        d.text((22, y), line, fill=(232, 226, 214), font=font(17))
        y += 20
    rounded(d, (22, 202, 142, 228), 13, (255, 253, 248))
    d.text((82, 215), "Open", fill=INK, font=font(15, True), anchor="mm")
    overlay = Image.new("RGBA", (w, 72), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.rounded_rectangle((0, 0, w, 72), radius=26, fill=(20, 34, 35, 34))
    overlay = overlay.filter(ImageFilter.GaussianBlur(8))
    img.alpha_composite(overlay, (0, h - 64))
    img.save(OUT / "humanchain-tag-content-card-345x240.png")


def showcase_home():
    w, h = 1080, 1080
    img = Image.new("RGB", (w, h), (246, 240, 231))
    d = ImageDraw.Draw(img)
    draw_phone_chrome(d, w, h, "Home")
    x0, y0, x1 = 46, 56, w - 46
    rounded(d, (x0, y0, x1, 430), 48, GREEN_DARK)
    d.ellipse((760, -90, 1120, 270), outline=(255, 253, 248, 58), width=3)
    draw_logo(d, 126, 138, 50)
    d.text((206, 106), "Verified human network", fill=(227, 221, 211), font=font(28, True))
    d.text((206, 146), "HumanChain", fill=(255, 253, 248), font=font(40, True))
    d.text((78, 236), "Where real humans\ncarry wisdom forward.", fill=(255, 253, 248), font=font(58, True), spacing=6)
    copy = "Ask real people, read human stories, save field wisdom, trade with nearby humans, and build a visible chain of purpose."
    y = 348
    for line in wrap_text(d, copy, font(25), 850)[:2]:
        d.text((78, y), line, fill=(255, 253, 248), font=font(25))
        y += 36
    chips = ["Daily human question", "Story vault", "Nearby marketplace", "Human points"]
    for i, chip in enumerate(chips):
        cx = 78 + (i % 2) * 465
        cy = 462 + (i // 2) * 68
        rounded(d, (cx, cy, cx + 420, cy + 48), 24, (76, 127, 104), outline=(132, 170, 151), width=2)
        d.text((cx + 28, cy + 12), chip, fill=(255, 253, 248), font=font(24, True))
    cards = [("Ask The\nWorld", "Real answers\nfrom verified\nhumans"), ("Join Today's\nChain", "Add one link to\nthe world"), ("Human\nMarket", "Buy, sell, and\npromote nearby"), ("Story Vault", "Monthly stories\nfrom real people")]
    for i, (title, text) in enumerate(cards):
        cx = 34 + (i % 3) * 342
        cy = 635 + (i // 3) * 230
        rounded(d, (cx, cy, cx + 304, cy + 205), 28, PAPER_STRONG, outline=LINE, width=2)
        d.text((cx + 32, cy + 52), title, fill=INK, font=font(31, True), spacing=3)
        d.text((cx + 32, cy + 130), text, fill=(120, 119, 111), font=font(21), spacing=4)
    img.save(OUT / "humanchain-showcase-1-home-1080x1080.png")


def showcase_ask():
    w, h = 1080, 1080
    img = Image.new("RGB", (w, h), (246, 240, 231))
    d = ImageDraw.Draw(img)
    draw_phone_chrome(d, w, h, "Ask")
    rounded(d, (42, 58, w - 42, 270), 42, (76, 104, 159))
    d.text((84, 88), "Ask people, not algorithms.", fill=(255, 253, 248), font=font(52, True))
    d.text((84, 160), "Publish one honest question and watch real answers form.", fill=(232, 236, 245), font=font(30), spacing=5)
    rounded(d, (42, 318, w - 42, 850), 38, PAPER_STRONG, outline=LINE, width=2)
    d.text((84, 368), "What do you want to ask humanity?", fill=INK, font=font(36, True))
    rounded(d, (84, 438, w - 84, 622), 30, (255, 252, 246), outline=LINE, width=2)
    d.text((120, 490), "Example: Should I leave my job and start\nmy own business?", fill=(126, 126, 123), font=font(30), spacing=8)
    modes = [("Text", "Public question", True), ("Voice", "Hear my tone", False), ("Private", "Hide identity", False), ("Deep Verdict", "Human report", False)]
    for i, (a, b, active) in enumerate(modes):
        cx = 84 + (i % 2) * 464
        cy = 665 + (i // 2) * 108
        rounded(d, (cx, cy, cx + 430, cy + 82), 24, GREEN if active else PAPER_STRONG, outline=LINE, width=2)
        d.text((cx + 28, cy + 14), a, fill=(255, 253, 248) if active else INK, font=font(30, True))
        d.text((cx + 28, cy + 52), b, fill=(232, 226, 214) if active else GOLD, font=font(22, True))
    topics = ["Life", "Love", "Money", "Business", "Family"]
    x = 84
    for i, t in enumerate(topics):
        tw = d.textbbox((0, 0), t, font=font(26))[2] + 52
        rounded(d, (x, 856, x + tw, 906), 25, GREEN if i == 0 else PAPER_STRONG, outline=LINE, width=2)
        d.text((x + tw / 2, 881), t, fill=(255, 253, 248) if i == 0 else INK, font=font(24), anchor="mm")
        x += tw + 16
    rounded(d, (84, 920, w - 84, 986), 33, INK)
    d.text((w // 2, 953), "Ask Verified Humans", fill=(255, 253, 248), font=font(34, True), anchor="mm")
    img.save(OUT / "humanchain-showcase-2-ask-1080x1080.png")


def showcase_market():
    w, h = 1080, 1080
    img = Image.new("RGB", (w, h), (246, 240, 231))
    d = ImageDraw.Draw(img)
    draw_phone_chrome(d, w, h, "Market")
    rounded(d, (42, 58, w - 42, 292), 44, (30, 78, 91))
    d.text((84, 104), "HumanChain Market", fill=(232, 226, 214), font=font(30, True))
    d.text((84, 154), "Simple bids.\nReal nearby humans.", fill=(255, 253, 248), font=font(50, True), spacing=2)
    d.text((84, 252), "Buy, sell, and promote nearby with safe receipts.", fill=(234, 239, 237), font=font(26))
    rounded(d, (42, 330, w - 42, 436), 28, PAPER_STRONG, outline=LINE, width=2)
    d.text((88, 366), "Nearby market active", fill=INK, font=font(32, True))
    d.text((88, 408), "Westlands - Browser/manual location only", fill=MUTED, font=font(25))
    items = [("Samsung Galaxy A54", "22 WLD target", "Best 20 WLD", "Next bid 20.5 WLD", True), ("Canvas tote bags", "4 WLD target", "Best 3.5 WLD", "Next bid 4 WLD", True), ("Restaurant launch poster", "Sponsored", "Direct inbox", "Marketing link", False)]
    for i, (title, price, best, nextbid, bidding) in enumerate(items):
        cy = 470 + i * 174
        rounded(d, (42, cy, w - 42, cy + 150), 30, PAPER_STRONG, outline=LINE, width=2)
        rounded(d, (84, cy + 28, 170, cy + 114), 22, BLUE if i == 0 else GOLD if i == 1 else GREEN)
        d.text((206, cy + 28), title, fill=INK, font=font(31, True))
        d.text((206, cy + 70), price, fill=GOLD, font=font(25, True))
        d.text((206, cy + 105), best, fill=MUTED, font=font(23))
        if bidding:
            rounded(d, (w - 286, cy + 54, w - 84, cy + 112), 29, INK)
            d.text((w - 185, cy + 83), "Place bid", fill=PAPER_STRONG, font=font(25, True), anchor="mm")
        else:
            rounded(d, (w - 330, cy + 54, w - 84, cy + 112), 29, (237, 247, 242), outline=(192, 221, 207), width=2)
            d.text((w - 207, cy + 83), "Seller chat", fill=GREEN, font=font(24, True), anchor="mm")
    img.save(OUT / "humanchain-showcase-3-market-1080x1080.png")


def meta_image():
    w, h = 1200, 600
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
    img.save(OUT / "humanchain-meta-image-1200x600.png")


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
