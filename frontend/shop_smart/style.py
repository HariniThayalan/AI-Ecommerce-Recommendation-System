# shop_smart/style.py
# Central design tokens — import from here, never hardcode hex values in pages.

PRIMARY       = "#6C63FF"
PRIMARY_DARK  = "#4B44CC"
SECONDARY     = "#FF6584"
SUCCESS       = "#43D9AD"
WARNING       = "#FFA34D"
BG_DARK       = "#0F0E17"
BG_CARD       = "#1A1A2E"
BG_SURFACE    = "#16213E"
TEXT_PRIMARY  = "#FFFFFE"
TEXT_SECONDARY = "#A7A9BE"
BORDER_COLOR  = "rgba(108,99,255,0.2)"

GRADIENT_PRIMARY = f"linear-gradient(135deg, {PRIMARY}, {SECONDARY})"

# ── Component style dicts ──────────────────────────────────────────────────────

CARD_STYLE = {
    "background": "rgba(26,26,46,0.85)",
    "border": f"1px solid {BORDER_COLOR}",
    "border_radius": "16px",
    "padding": "20px",
    "transition": "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "_hover": {
        "transform": "translateY(-6px)",
        "box_shadow": f"0 20px 40px rgba(108,99,255,0.25)",
        "border_color": PRIMARY,
    },
}

BUTTON_PRIMARY = {
    "background": GRADIENT_PRIMARY,
    "color": TEXT_PRIMARY,
    "border_radius": "10px",
    "font_weight": "600",
    "cursor": "pointer",
    "_hover": {"opacity": "0.88"},
}

BUTTON_GHOST = {
    "background": "transparent",
    "border": f"1px solid {BORDER_COLOR}",
    "color": TEXT_PRIMARY,
    "border_radius": "10px",
    "_hover": {"border_color": PRIMARY, "color": PRIMARY},
}

INPUT_STYLE = {
    "background": BG_SURFACE,
    "border": f"1px solid {BORDER_COLOR}",
    "color": TEXT_PRIMARY,
    "border_radius": "10px",
    "_focus": {"border_color": PRIMARY, "outline": "none"},
}

NAVBAR_STYLE = {
    "position": "sticky",
    "top": "0",
    "z_index": "100",
    "background": "rgba(15,14,23,0.85)",
    "backdrop_filter": "blur(20px)",
    "border_bottom": f"1px solid {BORDER_COLOR}",
    "padding": "0 24px",
    "height": "64px",
    "width": "100%",
}

BADGE_AI_STYLE = {
    "background": GRADIENT_PRIMARY,
    "color": TEXT_PRIMARY,
    "border_radius": "20px",
    "padding": "3px 10px",
    "font_size": "11px",
    "font_weight": "700",
    "white_space": "nowrap",
}
