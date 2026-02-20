const gallerySwiper = new Swiper('.myGallerySwiper', {
    loop: true,
    speed: 700,

    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },

    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },

    // Para que se vea bien en móvil y tablet
    breakpoints: {
        640: { slidesPerView: 1, spaceBetween: 0 },
        768: { slidesPerView: 1, spaceBetween: 0 },
        1024: { slidesPerView: 1, spaceBetween: 0 },
    },
});