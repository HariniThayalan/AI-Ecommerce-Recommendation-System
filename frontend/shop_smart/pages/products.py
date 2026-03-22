import reflex as rx
from shop_smart.components.navbar import navbar
from shop_smart.components.footer import footer
from shop_smart.components.filter_sidebar import filter_sidebar
from shop_smart.components.product_card import product_card
from shop_smart.state.app_state import AppState
from shop_smart.style import PRIMARY, TEXT_PRIMARY, TEXT_SECONDARY, BG_DARK, BORDER_COLOR


def product_grid() -> rx.Component:
    return rx.vstack(
        # Header bar
        rx.hstack(
            rx.vstack(
                rx.text("Products", font_size="22px", font_weight="800", color=TEXT_PRIMARY),
                rx.text(AppState.filtered_count, " items found",
                        color=TEXT_SECONDARY, font_size="13px"),
                spacing="0",
            ),
            rx.spacer(),
            rx.select(
                ["Relevance", "Price: Low to High", "Price: High to Low", "Top Rated"],
                placeholder="Sort by...",
                size="2",
                background=f"rgba(22,33,62,0.8)",
                border=f"1px solid {BORDER_COLOR}",
                color=TEXT_PRIMARY,
            ),
            width="100%",
            align="center",
            padding_bottom="4",
        ),
        # Loading skeleton or real grid
        rx.cond(
            AppState.is_loading,
            rx.center(
                rx.vstack(
                    rx.spinner(size="3", color=PRIMARY),
                    rx.text("Loading products...", color=TEXT_SECONDARY, font_size="14px"),
                    spacing="4",
                    align="center",
                ),
                padding="60px",
                width="100%",
            ),
            rx.grid(
                rx.foreach(AppState.filtered_products, lambda p: product_card(p)),
                columns=rx.breakpoints(initial="1", sm="2", lg="3", xl="4"),
                spacing="5",
                width="100%",
            ),
        ),
        width="100%",
        flex="1",
    )


def products() -> rx.Component:
    return rx.box(
        navbar(),
        rx.container(
            rx.flex(
                filter_sidebar(),
                product_grid(),
                direction=rx.breakpoints(initial="column", md="row"),
                gap="6",
                align="start",
                width="100%",
                padding_y="8",
            ),
            max_width="1440px",
            width="100%",
        ),
        background=BG_DARK,
        min_height="100vh",
        on_mount=AppState.fetch_products,
    )
