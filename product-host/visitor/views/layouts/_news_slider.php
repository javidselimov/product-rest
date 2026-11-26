<?php
/** @var $this \yii\web\View */
use common\models\NewsSlider;

$isHomePage = Yii::$app->controller->id === 'home' && Yii::$app->controller->action->id === 'index';
$newsSlides = $isHomePage ? NewsSlider::find()->where(['is_active' => 1])->orderBy(['ordering' => SORT_ASC])->all() : [];

if (!empty($newsSlides)):
?>
<style>
.hero-news {
    background: #f4f5f6;
    padding: 40px 0;
}

.hero-news__slider {
    position: relative;
    overflow: hidden;
}

.hero-news__track {
    display: flex;
    transition: transform 0.8s ease-in-out;
    cursor: grab;
    user-select: none;
}

.hero-news__track:active {
    cursor: grabbing;
}

.hero-slide {
    flex: 0 0 100%;
    display: flex;
    align-items: flex-start;
    /*justify-content: space-between;*/
    gap: 60px;
    /* transition: opacity 0.8s ease-in-out, visibility 0.8s ease-in-out; */ /* больше не нужно */
}

.hero-slide.active {
    /* position: relative; */ /* больше не нужно */
}

.hero-slide__content {
    flex: 1;
}

.hero-slide__date {
    font-size: 16px;
    font-weight: 400;
    color: #787878;
    margin-bottom: 30px;
}

.hero-slide__title {
    color: #14273c;
    font-size: 36px;
    font-weight: 600;
    line-height: 1.2;
    margin-bottom: 30px;

    border-left: 4px solid #4BC7B5;  /* цвет как в дизайне */
    padding-left: 20px;
}

.hero-slide__title a {
    color: inherit;
    text-decoration: none;
    pointer-events: none;
}

.hero-slide__text {
    font-size: 20px;
    font-weight: 400;
    line-height: 143%;
    color: #333;
    margin-bottom: 40px;
    max-width: 600px;
}

.hero-slide__btn {
    display: inline-block;
    background: #14273c;
    color: #fff;
    padding: 14px 56px;
    /*border-radius: 6px;*/
    text-decoration: none;
    font-weight: 500;
    transition: 0.3s;
}

.hero-slide__btn:hover {
    background: #0c3b55;
    color: #fff !important;
}

.hero-slide__image {
    flex: 1;
    width: 100%;
    aspect-ratio: 4 / 3;
    position: relative;
    overflow: hidden;
}

.hero-slide__image img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    /*border-radius: 8px;*/
}

/* pagination */
.hero-news__pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    margin-top: 35px;
    font-size: 0;
    line-height: 0;
}

.hero-dot {
    display: block;
    width: 48px;
    height: 6px;
    background: #d9d9d9;
    border-radius: 4px;
    cursor: pointer;
    transition: 0.3s;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    transform: translateZ(0);
}

.hero-dot.active {
    background: #787878;
    width: 64px;
}

@media (max-width: 1170px) {
    .hero-slide {
        gap: 30px;
    }
    .hero-slide__title {
        font-size: 32px;
    }
    .hero-slide__text {
        font-size: 16px;
    }
}

@media(max-width: 1080px){
    .hero-slide__title{
        font-size: 32px;
    }
}


@media (max-width: 1000px) {
    .hero-slide__text {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

@media (max-width: 755px) {
    .hero-slide {
        flex-direction: column;
        gap: 15px;
    }

    .hero-slide__content {
        display: contents;
    }

    .hero-slide__date {
        order: 1;
        margin-bottom: 0;
    }

    .hero-slide__image {
        order: 2;
        width: 100%;
        flex: none; /* prevent from stretching */
    }

    .hero-slide__title {
        order: 3;
        font-size: 28px;
        margin-top: 5px;
        margin-bottom: 0;

        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .hero-slide__text {
        display: none;
    }

    .hero-slide__btn {
        display: none;
    }

    .hero-slide__title a {
        pointer-events: auto;
    }

    .hero-slide__title a::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10;
    }
}

@media (max-width: 568px) {
    .hero-news {
        padding: 20px 15px;
    }
}
</style>

<section class="hero-news">
    <div class="container">
        <div class="hero-news__slider">
            <div class="hero-news__track">
                <?php foreach ($newsSlides as $index => $slide): ?>
                    <!-- SLIDE -->
                    <div class="hero-slide <?= $index === 0 ? 'active' : '' ?>">
                        <div class="hero-slide__content">
                            <div class="hero-slide__date"><?= Yii::$app->formatter->asDate($slide['news_date'], 'd MMMM yyyy') ?></div>
                            <h1 class="hero-slide__title">
                                <a draggable="false" href="<?= htmlspecialchars($slide->{'link_' . Yii::$app->language}, ENT_QUOTES, 'UTF-8') ?>">
                                    <?= htmlspecialchars($slide->{'title_' . Yii::$app->language}, ENT_QUOTES, 'UTF-8') ?>
                                </a>
                            </h1>

                            <p class="hero-slide__text">
                                <?= htmlspecialchars(strip_tags($slide->{'description_' . Yii::$app->language}), ENT_QUOTES, 'UTF-8') ?>
                            </p>

                            <a href="<?= htmlspecialchars($slide->{'link_' . Yii::$app->language}, ENT_QUOTES, 'UTF-8') ?>" class="hero-slide__btn">
                                <?= Yii::t('app', 'Read-More') ?>
                            </a>
                        </div>

                        <div class="hero-slide__image">
                            <img draggable="false" src="<?=Yii::$app->params['uploadsUrl']?>/news_slider/<?= $slide->image_path ?>" alt="<?= htmlspecialchars($slide->{'title_' . Yii::$app->language}, ENT_QUOTES, 'UTF-8') ?>">
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>

            <!-- BULLETS -->
            <div class="hero-news__pagination">
                <?php foreach ($newsSlides as $index => $slide): ?><span class="hero-dot <?= $index === 0 ? 'active' : '' ?>"></span><?php endforeach; ?>
            </div>
        </div>
    </div>
</section>

<script>
document.addEventListener("DOMContentLoaded", function () {
    const slides = document.querySelectorAll(".hero-slide");
    const dots = document.querySelectorAll(".hero-dot");
    const track = document.querySelector(".hero-news__track");

    if (!slides.length) return;

    let current = 0;
    let interval = null;

    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID = 0;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove("active"));
        dots.forEach(dot => dot.classList.remove("active"));

        slides[index].classList.add("active");
        dots[index].classList.add("active");

        currentTranslate = -index * 100;
        prevTranslate = currentTranslate;
        track.style.transition = 'transform 0.8s ease-in-out';
        track.style.transform = `translateX(${currentTranslate}%)`;

        current = index;
    }

    // --- SWIPE LOGIC ---
    track.addEventListener('mousedown', dragStart);
    track.addEventListener('touchstart', dragStart);

    track.addEventListener('mouseup', dragEnd);
    track.addEventListener('touchend', dragEnd);
    track.addEventListener('mouseleave', dragEnd);

    track.addEventListener('mousemove', dragMove);
    track.addEventListener('touchmove', dragMove, { passive: false });

    // Отключаем стандартное поведение перетаскивания для картинок и ссылок в заголовке
    track.querySelectorAll('img, .hero-slide__title a').forEach(el => {
        el.addEventListener('dragstart', (e) => e.preventDefault());
    });

    function dragStart(event) {
        isDragging = true;
        startPos = getPositionX(event);
        animationID = requestAnimationFrame(animation);
        track.style.transition = 'none';
        clearInterval(interval);
    }

    function dragMove(event) {
        if (isDragging) {
            if (event.type === 'touchmove') {
                event.preventDefault();
            }
            const currentPosition = getPositionX(event);
            const diff = ((currentPosition - startPos) / track.offsetWidth) * 100;
            currentTranslate = prevTranslate + diff;
        }
    }

    function dragEnd() {
        isDragging = false;
        cancelAnimationFrame(animationID);

        const movedBy = currentTranslate - prevTranslate;

        if (movedBy < -10 && current < slides.length - 1) {
            current += 1;
        }

        if (movedBy > 10 && current > 0) {
            current -= 1;
        }

        showSlide(current);
        resetAuto();
    }

    function getPositionX(event) {
        return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    }

    function animation() {
        setSliderPosition();
        if (isDragging) requestAnimationFrame(animation);
    }

    function setSliderPosition() {
        track.style.transform = `translateX(${currentTranslate}%)`;
    }
    track.addEventListener('click', (e) => {
        if (Math.abs(currentTranslate - prevTranslate) > 1) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);
    // --- END SWIPE LOGIC ---

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            showSlide(index);
            resetAuto();
        });
    });

    function autoSlide() {
        current = (current + 1) % slides.length;
        showSlide(current);
    }

    function resetAuto() {
        clearInterval(interval);
        interval = setInterval(autoSlide, 6000);
    }

    interval = setInterval(autoSlide, 6000);
});
</script>
<?php endif; ?>
