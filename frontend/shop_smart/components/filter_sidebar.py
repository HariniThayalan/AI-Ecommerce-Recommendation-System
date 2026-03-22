import reflex as rx
from shop_smart.style import (
    PRIMARY, TEXT_PRIMARY, TEXT_SECONDARY,
    BORDER_COLOR, BG_CARD, BG_SURFACE,
)
from shop_smart.state.app_state import AppState

CATEGORIES = ["All", "Electronics", "Fashion", "Home & Kitchen", "Sports", "Books"]
RATINGS    = [("0", "Any Rating"), ("3.5", "3.5★+"), ("4.0", "4.0★+"), ("4.5", "4.5★+")]
MODES = [
    ("top_rated",     "🔥 Top Rated"),
    ("content",       "🧠 Content-Based"),
    ("collaborative", "👥 Collaborative"),
    ("top_rated",     "⚡ Hybrid"),       # hybrid requires product context
]


def filter_sidebar() -> rx.Component:
    return rx.vstack(
        rx.text("Filter & AI Mode", font_weight="700", font_size="16px", color=TEXT_PRIMARY),
        rx.divider(color=BORDER_COLOR),

        # ── AI Recommendation Mode ─────────────────────────────────────────
        rx.vstack(
            rx.text("🤖 Recommendation Mode", font_weight="600", color=PRIMARY, font_size="13px"),
            rx.select(
                ["Top Rated", "Content-Based", "Collaborative", "Hybrid"],
                placeholder="Select mode...",
                on_change=AppState.set_recommendation_mode,
                background=f"rgba(108,99,255,0.1)",
                border=f"1px solid {PRIMARY}",
                color=TEXT_PRIMARY,
                size="2",
                width="100%",
            ),
            rx.cond(
                AppState.recommendation_mode == "content",
                rx.text("📌 Similarity based on product features", font_size="11px", color=TEXT_SECONDARY),
                rx.cond(
                    AppState.recommendation_mode == "collaborative",
                    rx.text("📌 Users like you also bought", font_size="11px", color=TEXT_SECONDARY),
                    rx.text("📌 AI selects the best products for you", font_size="11px", color=TEXT_SECONDARY),
                ),
            ),
            align_items="start", spacing="2", width="100%",
        ),
        rx.divider(color=BORDER_COLOR),

        # ── Price Range ─────────────────────────────────────────────────────
        rx.vstack(
            rx.text("Price Range (₹)", font_weight="600", color=TEXT_PRIMARY, font_size="13px"),
            rx.slider(
                default_value=[0, 100000],
                min=0,
                max=100000,
                step=1000,
                color_scheme="violet",
                on_change=AppState.set_price_range,
                width="100%",
            ),
            rx.hstack(
                rx.text("₹", AppState.price_range[0], font_size="12px", color=TEXT_SECONDARY),
                rx.spacer(),
                rx.text("₹", AppState.price_range[1], font_size="12px", color=TEXT_SECONDARY),
                width="100%",
            ),
            align_items="start", spacing="2", width="100%",
        ),
        rx.divider(color=BORDER_COLOR),

        # ── Categories ──────────────────────────────────────────────────────
        rx.vstack(
            rx.text("Category", font_weight="600", color=TEXT_PRIMARY, font_size="13px"),
            rx.foreach(
                CATEGORIES,
                lambda cat: rx.button(
                    cat,
                    on_click=AppState.toggle_category(cat),
                    size="2",
                    width="100%",
                    justify="start",
                    variant=rx.cond(
                        AppState.selected_category.contains(cat),
                        "solid",
                        "ghost",
                    ),
                    color_scheme="violet",
                ),
            ),
            align_items="start", spacing="1", width="100%",
        ),
        rx.divider(color=BORDER_COLOR),

        # ── Minimum Rating ──────────────────────────────────────────────────
        rx.vstack(
            rx.text("Minimum Rating", font_weight="600", color=TEXT_PRIMARY, font_size="13px"),
            rx.radio(
                ["Any", "3.5+ Stars", "4+ Stars", "4.5+ Stars"],
                on_change=AppState.set_min_rating,
                direction="column",
                spacing="2",
                color_scheme="violet",
            ),
            align_items="start", spacing="2", width="100%",
        ),
        rx.divider(color=BORDER_COLOR),

        # ── Action buttons ──────────────────────────────────────────────────
        rx.vstack(
            rx.button(
                "Apply Filters",
                on_click=AppState.apply_filters,
                background=PRIMARY,
                width="100%",
                size="2",
                color="white",
                border_radius="10px",
            ),
            rx.button(
                "Reset",
                variant="ghost",
                color_scheme="gray",
                width="100%",
                size="2",
                on_click=AppState.set_selected_category([]),
            ),
            spacing="2",
            width="100%",
        ),

        padding="20px",
        border_radius="16px",
        background=BG_CARD,
        border=f"1px solid {BORDER_COLOR}",
        width=rx.breakpoints(initial="100%", md="260px"),
        min_width=rx.breakpoints(initial="unset", md="260px"),
        align_items="start",
        spacing="4",
        height="fit-content",
    )
