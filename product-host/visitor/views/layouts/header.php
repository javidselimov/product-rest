<?
/* @var $this \yii\web\View
 */

use yii\helpers\Url;
use yii\widgets\ActiveForm;
use common\models\RunningLine;
use common\models\NewsSlider;

?>
<style>
    .marquee-wrapper {
        width: 100%;
        overflow: hidden;
        background-color: #dbe6f1!important;
        padding: 20px 0;
    }

    .marquee {
        display: inline-block;
        white-space: nowrap;
        will-change: transform;

    }
    .marquee A{
        color: #000;
    }
</style>

<header>
    <div class="container">
        <?php
        $runningLine = RunningLine::getActiveLine();

        ?>

        <?php if ($runningLine && $runningLine->activity): ?>
            <div class="marquee-wrapper" id="marqueeWrapper">
                <div class="marquee" id="marquee">
                    <?php
                    $language = substr(Yii::$app->language, 0, 2);
                    // Check if the model has the new language-specific fields
                    $hasNewFields = isset($runningLine->line_text_az);

                    if ($hasNewFields) {
                        $textField = 'line_text_' . $language;
                        $linkField = 'link_' . $language;

                        if (!empty($runningLine->$linkField)): ?>
                            <a href="<?= htmlspecialchars($runningLine->$linkField, ENT_QUOTES, 'UTF-8') ?>">
                                <?= htmlspecialchars($runningLine->$textField, ENT_QUOTES, 'UTF-8') ?>
                            </a>
                        <?php else: ?>
                            <?= htmlspecialchars($runningLine->$textField, ENT_QUOTES, 'UTF-8') ?>
                        <?php endif;
                    } else {
                        // Fallback to the old fields
                        if (!empty($runningLine->link)): ?>
                            <a href="<?= htmlspecialchars($runningLine->link, ENT_QUOTES, 'UTF-8') ?>">
                                <?= htmlspecialchars($runningLine->line_text, ENT_QUOTES, 'UTF-8') ?>
                            </a>
                        <?php else: ?>
                            <?= htmlspecialchars($runningLine->line_text, ENT_QUOTES, 'UTF-8') ?>
                        <?php endif;
                    }
                    ?>
                </div>
            </div>


            <script>
                document.addEventListener('DOMContentLoaded', () => {
                    const marquee = document.getElementById('marquee');
                    const wrapper = document.getElementById('marqueeWrapper');

                    if (!marquee || !wrapper) return;

                    const SPEED = 80; // px в секунду (ОДИНАКОВАЯ ВЕЗДЕ)

                    const marqueeWidth = marquee.offsetWidth;
                    const wrapperWidth = wrapper.offsetWidth;

                    const distance = marqueeWidth + wrapperWidth;
                    const duration = distance / SPEED;

                    marquee.style.transform = `translateX(${wrapperWidth}px)`;

                    marquee.animate(
                        [
                            { transform: `translateX(${wrapperWidth}px)` },
                            { transform: `translateX(-${marqueeWidth}px)` }
                        ],
                        {
                            duration: duration * 1000,
                            iterations: Infinity,
                            easing: 'linear'
                        }
                    );

                    marquee.addEventListener('mouseenter', () => marquee.getAnimations()[0].pause());
                    marquee.addEventListener('mouseleave', () => marquee.getAnimations()[0].play());

                });
            </script>

        <?php endif; ?>
        <style>
            .header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: #f8fafc!important;
                padding: 40px 0 24px 0px!important;
            }
            .header .logo img {
                width: 240px;
                height: auto;
            }
            .head_right {
                display: flex;
                align-items: center;
                gap: 20px;
            }
            .lang a {
                color: #172c41;
                font-size: 16px;
                font-weight: 500;
                text-transform: uppercase;
                text-decoration: none;
                display: block;
                transition: color 0.3s ease;
            }
            .lang a:hover {
                color: #132438;
            }
            .meas_block {
            }
            .header_hotline {
                display: flex;
                align-items: center;
                gap: 5px;
                text-decoration: none;
            }
            /* Make the selects shorter in the header */
            .header .ctegory_search { width: 180px; }
            .header .ctegory_search.meas_block { width: 180px; }

            /* Hide unstyled selects to prevent FOUC */
            select.formstyler {
                opacity: 0;
            }

            /* Collapsible search: show only magnifier by default */
            .header .search_block { position: relative; display: flex; align-items: center; }
            .header .search_block .input_area {
                width: 0;
                opacity: 0;
                margin-left: 0;
                overflow: hidden;
                transition: width .2s ease, opacity .2s ease, margin-left .2s ease;
            }
            .header .search_block.is-open .input_area {
                width: 180px; /* matches compact width */
                opacity: 1;
                margin-left: 10px;
            }
            /* Ensure the input itself stretches within the revealed area */
            .header .search_block .input_area .input_search { width: 100%; }

            .ecbar_btn {
                background: #172c41;
                color: #fff;
                padding: 14px 40px;
                font-weight: 500;
                text-decoration: none;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 40px;
                border: none;
                transition: background 0.3s ease;
                font-size: 16px;
            }
            .ecbar_btn:hover {
                background: #0c3b55;
                color: #fff;
                text-decoration: none;
            }
            .mh-menu .ecbar_btn, .mh-menu .lang a {
                height: auto;
                background: none;
                padding: 29px 10px;
                justify-content: center;
                border-bottom: 1px solid #14273C;
                font-size: 17px;
                color: #fff;
                transition: background 0s ease;
            }
            .mh-menu .ecbar_btn:hover, .mh-menu .lang a:hover {
                background: #132438;
            }

            .menu-btn {
                display: none;
                flex-direction: column;
                justify-content: space-between;
                width: 25px;
                height: 18px;
                cursor: pointer;
                background: none;
                border: none;
                padding: 0;
                /*margin-left: 20px;*/
                vertical-align: middle;
            }
            .menu-btn span {
                display: block;
                width: 100%;
                height: 3px;
                background-color: #172c41;
                transition: background-color 0.3s ease;
            }
            .menu-btn:hover span {
                background-color: #132438;
            }

            .show-max-568 {
                display: none !important;
            }

            @media (max-width: 980px) {
                .header > *:not(.logo):not(.head_right) {
                    display: none !important;
                }
                .head_right > *:not(.ecbar_btn):not(.menu-btn):not(.lang) {
                    display: none !important;
                }
                header {
                    position: sticky!important;
                    top: 0!important;
                    z-index: 1000;
                    background: #f8fafc;
                    box-shadow: 0 5px 5px -5px rgba(0, 0, 0, 0.5);
                }
                .header {
                    padding: 14px 0 !important;
                    box-shadow: none !important;
                    background: transparent !important;
                }
                .header .logo img {
                    width: 180px;
                }
                .menu-btn {
                    display: flex !important;
                }

                .head_right {
                    gap: 30px;
                }

            }
            @media (max-width: 568px) {
                .header{
                    padding: 14px 20px !important;
                }
                .header .ecbar_btn, .header .search_block {
                    display: none !important;
                }
                .show-max-568 {
                    display: block !important;
                }
            }

        </style>
        <div class="header">
            <div class="logo">
                <a href="/">
                    <img src="/images/logo-<? echo Yii::$app->language == 'en' ? 'en' : 'az'; ?>.svg?v=2" alt="Logo">
                </a>
            </div>
            <? echo \visitor\widgets\LiveStreamWidget::widget() ?>
            <div class="head_right">
                <div class="ctegory_search meas_block">
                    <select class="formstyler auto-redirect" onchange="if (this.value) window.location.href=this.value;">
                        <option value=""><? echo Yii::t('app', 'MEAS') ?></option>
                        <option value="<? echo Url::to(['meas/index']) ?>"><? echo Yii::t('app', 'MEAS Page') ?></option>
                        <option value="/page-182/about-esid"><? echo Yii::t('app', 'MEAS About') ?></option>
                    </select>
                </div>
                <? $searchForm = ActiveForm::begin(['action' => Url::to(['/search/index']), 'method' => 'get', 'options' => ['id' => 'searchForm', 'enctype' => 'multipart/form-data']]); ?>
                <div class="search_block">

                    <div class="input_area">
                        <input type="text" name="query" id="query" placeholder="<? echo Yii::t('app', 'Search') ?>" class="input_search">
                    </div>
                    <input type="hidden" name="type" id="type" value="pages">
                    <div class="search_submit">
                        <input type="submit" class="search_sub_btn" value="false">
                    </div>
                </div>
                <? $searchForm::end(); ?>
                <script>
                    document.addEventListener('DOMContentLoaded', function () {
                        var searchBlock = document.querySelector('.header .search_block');
                        if (!searchBlock) return;
                        var btn = searchBlock.querySelector('.search_sub_btn');
                        var input = searchBlock.querySelector('#query');

                        // Open on first click, submit on next
                        if (btn) {
                            btn.addEventListener('click', function (e) {
                                if (!searchBlock.classList.contains('is-open')) {
                                    e.preventDefault();
                                    searchBlock.classList.add('is-open');
                                    if (input) setTimeout(function(){ input.focus(); }, 0);
                                } else {
                                    // If open and input is empty, close it
                                    if (input && input.value.trim() === "") {
                                        e.preventDefault();
                                        searchBlock.classList.remove('is-open');
                                        input.blur();
                                    }
                                }
                            });
                        }

                        // Close when clicking outside
                        document.addEventListener('click', function (e) {
                            if (!searchBlock.contains(e.target)) {
                                searchBlock.classList.remove('is-open');
                            }
                        });

                        // Close on Escape
                        if (input) {
                            input.addEventListener('keydown', function (e) {
                                if (e.key === 'Escape') {
                                    searchBlock.classList.remove('is-open');
                                    input.blur();
                                }
                            });
                        }
                    });
                </script>
                <a href="tel:966" class="header_hotline hint--bottom hint--bounce semi-bold blue" aria-label="<? echo Yii::t('footer', 'Hotline') ?>"><img src="/images/phone-receiver.svg"/>966</a>

                <div class="lang">
                    <? if (Yii::$app->language == 'az'): ?>
                        <a href="<? echo Url::current(['language' => 'en']) ?>">EN</a>
                    <? else: ?>
                        <a href="<? echo Url::current(['language' => 'az']) ?>">AZ</a>
                    <? endif; ?>
                </div>

                <a href="https://e-cbar.az/" target="_blank" class="ecbar_btn">E-CBAR</a>
                <a href="#menu" class="menu-btn">
                    <span></span>
                    <span></span>
                    <span></span>
                </a>
            </div>
        </div>
        <?/*
        <div class="header_menu m_header_menu">
            <ul class="menu mh-menu">
                <? echo $this->render('menu/meas') ?>
                <li>
                    <a href="tel:966" class="header_hotline hint--bottom hint--bounce semi-bold blue" aria-label="<? echo Yii::t('footer', 'Hotline') ?>"><img src="/images/phone-receiver.svg"/>966</a>
                </li>
                <li>
                    <div class="lang">
                        <? if (Yii::$app->language == 'az'): ?>
                            <a href="<? echo Url::current(['language' => 'en']) ?>">EN</a>
                        <? else: ?>
                            <a href="<? echo Url::current(['language' => 'az']) ?>">AZ</a>
                        <? endif; ?>
                    </div>
                </li>
                <li>
                    <a href="https://e-cbar.az/" target="_blank" class="ecbar_btn">E-CBAR</a>
                </li>
            </ul>
        </div>
        */?>
    </div>
</header>

