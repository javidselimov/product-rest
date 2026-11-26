<?php
/* Organizational structure org-chart — shared partial. Used by structure/index and pages/index (page 5). */
?>
                    <!-- ===== ORG CHART START ===== -->
                    <style>
                        .oc-wrap{max-width:926px;margin:0 auto;overflow-x:auto;font-family:Arial, Helvetica, sans-serif;}
                        .oc{position:relative;width:926px;margin:0 auto;padding-top:48px; padding-bottom:5px;}
                        .oc svg.oc-lines{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;}
                        .oc .oc-node{position:relative;z-index:1;box-sizing:border-box;overflow-wrap:break-word;word-wrap:break-word;}
                        .oc .oc-n{font-weight:700;}
                        .oc .oc-r{font-weight:400;}

                        .oc .oc-navy{background:#284673;color:#fff;}
                        .oc .oc-blue{background:rgba(0, 179, 222, 1);border:1px solid rgba(0, 179, 222, 1);color:#fff;}
                        .oc .oc-green{background:#00CBB6;color:#fff;}
                        .oc .oc-dirbox{background:#f3f3f3;color:#20323f;border:1px solid #c9ced3;}
                        .oc .oc-sidebox{background:#fff;color:#20323f;border:1px solid #a9ded4;}
                        .oc .oc-sidebox.oc-fill{background:#d8f3f0;}
                        .oc .oc-deptbox{background:#fff;color:#20323f;border:1px solid #a9ded4;}

                        .oc .oc-top{display:flex;align-items:flex-start;justify-content:center;position:relative;}
                        .oc .oc-chair{width:240px;min-height:92px;padding:12px;display:flex;flex-direction:column;
                            justify-content:center;gap:8px;text-align:center;}
                        .oc .oc-chair .oc-n{font-size:13px;line-height:1.1;}
                        .oc .oc-chair .oc-t{font-size:11px;font-weight:500;line-height:1.35;}
                        .oc .oc-sidecol{position:absolute;right:0;top:50%;transform:translateY(-50%);width:205px;display:flex;flex-direction:column;gap:5px;}
                        .oc .oc-side{padding:5px 8px;font-size:9px;line-height:1.3;text-align:left;display:flex;align-items:center;}

                        .oc .oc-body{display:flex;justify-content:space-between;align-items:flex-start;margin-top:90px;box-sizing:border-box;padding-right:22px;}
                        .oc .oc-grp{display:flex;flex-direction:column;align-items:center;min-width:120px;}
                        .oc .oc-depslot{position:relative;width:100%;display:flex;justify-content:center;min-height:220px;}
                        .oc .oc-dep{width:130px;padding:8px;text-align:center;display:flex;flex-direction:column;
                            justify-content:center;gap:6px;position:absolute;}
                        .oc .oc-dep .oc-n{font-size:11px;line-height:1.15;}
                        .oc .oc-dep .oc-t{font-size:9px;font-weight:500;line-height:1.3;}
                        .oc .oc-dep.oc-tall{min-height:100px;top:0;}
                        .oc .oc-dep.oc-norm{min-height:100px;top:120px;}

                        .oc .oc-cols{display:flex;justify-content:center;gap:6px;margin-top:32px;}
                        .oc .oc-col{display:flex;flex-direction:column;gap:10px;width:61px;}
                        .oc .oc-dir{padding:6px 4px;text-align:center;font-size:9px;line-height:1.2;min-height:74px;
                            display:flex;flex-direction:column;justify-content:center;gap:4px;}
                        .oc .oc-blk{padding:7px 4px 20px;text-align:center;font-size:9px;line-height:1.25;position:relative;
                            min-height:20px;display:flex;align-items:center;justify-content:center;}
                        .oc .oc-chev{position:absolute;right:8px;bottom:8px;width:7px;height:4px;
                            background:url(/images/icons/structure-arrow.svg) no-repeat center;background-size:7px 4px;transition:transform .3s ease;}

                        .oc .oc-inkisaf{width:60px;padding:7px 0 20px;font-size:9px;text-align:center;color:#fff;background:#00CBB6;}
                        .oc .oc-deptgrid{display:flex;gap:6px;margin-top:0;}
                        .oc .oc-deptcol{display:flex;flex-direction:column;gap:10px;width:60px;}
                        .oc .oc-dept{width:60px;padding:7px 4px;font-size:9px;line-height:1.25;text-align:center;min-height:44px;
                            display:flex;align-items:center;justify-content:center;}
                        .oc .oc-drop{cursor:pointer;user-select:none;-webkit-user-select:none;}
                        .oc .oc-sub{display:grid;grid-template-rows:0fr;width:60px;margin-top:-10px;transition:grid-template-rows .55s ease, margin-top .55s ease;}
                        .oc .oc-sub-inner{overflow:hidden;min-height:0;display:flex;flex-direction:column;gap:10px;}
                        /* keep each dept box at its full size (no shrinking) so it reveals/fades in instead of "growing" */
                        .oc .oc-sub-inner .oc-dept{flex-shrink:0;opacity:0;transform:translateY(-8px);
                            transition:opacity .4s ease, transform .4s ease;}
                        .oc .oc-drop.oc-open + .oc-sub{grid-template-rows:1fr;margin-top:0;}
                        .oc .oc-drop.oc-open + .oc-sub .oc-sub-inner .oc-dept{opacity:1;transform:translateY(0);}
                        /* stagger the fade-in so departments appear one after another */
                        .oc .oc-drop.oc-open + .oc-sub .oc-sub-inner .oc-dept:nth-child(1){transition-delay:.10s;}
                        .oc .oc-drop.oc-open + .oc-sub .oc-sub-inner .oc-dept:nth-child(2){transition-delay:.22s;}
                        .oc .oc-drop.oc-open + .oc-sub .oc-sub-inner .oc-dept:nth-child(3){transition-delay:.34s;}
                        .oc .oc-drop.oc-open + .oc-sub .oc-sub-inner .oc-dept:nth-child(4){transition-delay:.46s;}
                        .oc .oc-drop.oc-open + .oc-sub .oc-sub-inner .oc-dept:nth-child(5){transition-delay:.58s;}
                        .oc .oc-drop.oc-open .oc-chev{transform:rotate(180deg);}
                        .oc .oc-dept.oc-dept-y{background:rgba(229,172,0,0.19);border-color:rgba(255,197,9,1);}
                        .oc .oc-dept.oc-dept-t{background:rgba(0,203,182,0.1);border-color:rgba(0,203,182,0.5);}
                        .oc .oc-col-wide{width:72px;}
                        .oc .oc-col-wide .oc-sub{width:72px;}
                        .oc .oc-col-wide .oc-dept{width:72px;}
                        /* responsive fallback image for narrow viewports (<=1370px) */
                        .oc-note{margin-top:8px;color:#20323f;text-align:left;font-family:Arial, Helvetica, sans-serif;
                            font-weight:500;font-style:italic;font-size:14px;line-height:1.4;letter-spacing:normal; color:#787878;}
                        .oc-mobile-img{display:none;}
                        .oc-mobile-img img{display:block;max-width:100%;height:auto;margin:0 auto;}
                        @media (max-width:1370px){
                            .oc-wrap{display:none;}
                            .oc-mobile-img{display:block;}
                        }
                    </style>

                    <div class="oc-wrap">
                        <div class="oc" id="oc_root">
                            <svg class="oc-lines" id="oc_lines"></svg>

                            <!-- TOP -->
                            <div class="oc-top">
                                <div class="oc-node oc-chair oc-navy" id="oc_chair">
                                    <div class="oc-n"><?= Yii::t('structure', 'chair-name') ?></div>
                                    <div class="oc-t"><?= Yii::t('structure', 'chair-title') ?></div>
                                </div>
                                <div class="oc-sidecol">
                                    <div class="oc-node oc-side oc-sidebox" id="oc_s1"><?= Yii::t('structure', 's1') ?></div>
                                    <div class="oc-node oc-side oc-sidebox" id="oc_s2"><?= Yii::t('structure', 's2') ?></div>
                                    <div class="oc-node oc-side oc-sidebox" id="oc_s3"><?= Yii::t('structure', 's3') ?></div>
                                    <div class="oc-node oc-side oc-sidebox" id="oc_s4"><?= Yii::t('structure', 's4') ?></div>
                                    <div class="oc-node oc-side oc-sidebox oc-fill" id="oc_s5"><?= Yii::t('structure', 's5') ?></div>
                                </div>
                            </div>

                            <!-- DEPUTIES + DIRECTORS -->
                            <div class="oc-body">

                                <!-- G1: Əliyar -->
                                <div class="oc-grp">
                                    <div class="oc-depslot">
                                        <div class="oc-node oc-dep oc-blue oc-tall" id="oc_dep1" style="transform:translateX(30px);width:152px;">
                                            <div class="oc-n"><?= Yii::t('structure', 'dep1-name') ?></div>
                                            <div class="oc-t"><?= Yii::t('structure', 'dep1-title') ?></div>
                                        </div>
                                    </div>
                                    <div class="oc-cols">
                                        <div class="oc-col">
                                            <div class="oc-node oc-dirbox oc-dir" id="oc_d_vuqar"><span class="oc-r"><?= Yii::t('structure', 'role-director') ?></span></div>
                                            <div class="oc-node oc-blk oc-green oc-drop "><?= Yii::t('structure', 'blk-research') ?><span class="oc-chev"></span></div>
                                            <div class="oc-sub">
                                                <div class="oc-sub-inner">
                                                <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-research') ?></div>
                                                <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-statistics') ?></div>
                                                </div>
                                            </div>
                                            <div class="oc-node oc-blk oc-green oc-drop "><?= Yii::t('structure', 'blk-monetary') ?><span class="oc-chev"></span></div>
                                            <div class="oc-sub">
                                                <div class="oc-sub-inner">
                                                <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-monetary') ?></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="oc-col oc-col-wide">
                                            <div class="oc-node oc-dirbox oc-dir" id="oc_d_vusalc"><span class="oc-n"><?= Yii::t('structure', 'dir-vusalc') ?></span><span class="oc-r"><?= Yii::t('structure', 'role-director') ?></span></div>
                                            <div class="oc-node oc-blk oc-green oc-drop "><?= Yii::t('structure', 'blk-fin-stability') ?><span class="oc-chev"></span></div>
                                            <div class="oc-sub">
                                                <div class="oc-sub-inner">
                                                <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-fin-stability') ?></div>
                                                <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-fin-sector-dev') ?></div>
                                                <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-market-conduct') ?></div>
                                                <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-resolution') ?></div>
                                                <div class="oc-node oc-dept oc-deptbox oc-dept-t"><?= Yii::t('structure', 'dep-fin-literacy') ?></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="oc-col ">
                                            <div class="oc-node oc-dirbox oc-dir" id="oc_d_sahin"><span class="oc-n"><?= Yii::t('structure', 'dir-sahin') ?></span><span class="oc-r"><?= Yii::t('structure', 'role-director') ?></span></div>
                                            <div class="oc-node oc-blk oc-green oc-drop "><?= Yii::t('structure', 'blk-insurance') ?><span class="oc-chev"></span></div>
                                            <div class="oc-sub">
                                                <div class="oc-sub-inner">
                                                <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-insurance-reg') ?></div>
                                                <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-insurance-sup') ?></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- G2: Toğrul -->
                                <div class="oc-grp">
                                    <div class="oc-depslot">
                                        <div class="oc-node oc-dep oc-blue oc-norm" id="oc_dep2">
                                            <div class="oc-n"><?= Yii::t('structure', 'dep2-name') ?></div>
                                            <div class="oc-t"><?= Yii::t('structure', 'dep-title') ?></div>
                                        </div>
                                    </div>
                                    <div class="oc-cols">
                                        <div class="oc-col oc-col-wide">
                                            <div class="oc-node oc-dirbox oc-dir" id="oc_d_fuad"><span class="oc-n"><?= Yii::t('structure', 'dir-fuad') ?></span><span class="oc-r"><?= Yii::t('structure', 'role-director') ?></span></div>
                                            <div class="oc-node oc-blk oc-green oc-drop "><?= Yii::t('structure', 'blk-credit') ?><span class="oc-chev"></span></div>
                                            <div class="oc-sub">
                                                <div class="oc-sub-inner">
                                                <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-credit-policy') ?></div>
                                                <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-banking-sup') ?></div>
                                                <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-nonbank-sup') ?></div>
                                                </div>
                                            </div>
                                            <div class="oc-node oc-blk oc-green oc-drop "><?= Yii::t('structure', 'blk-fin-monitoring') ?><span class="oc-chev"></span></div>
                                            <div class="oc-sub">
                                                <div class="oc-sub-inner">
                                                <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-finmon-policy') ?></div>
                                                <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-finmon') ?></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- G3: Əli -->
                                <div class="oc-grp">
                                    <div class="oc-depslot">
                                        <div class="oc-node oc-dep oc-blue oc-norm" id="oc_dep3">
                                            <div class="oc-n"><?= Yii::t('structure', 'dep3-name') ?></div>
                                            <div class="oc-t"><?= Yii::t('structure', 'dep-title') ?></div>
                                        </div>
                                    </div>
                                    <div class="oc-cols">
                                        <div class="oc-col">
                                            <div class="oc-node oc-dirbox oc-dir" id="oc_d_elrad"><span class="oc-n"><?= Yii::t('structure', 'dir-elrad') ?></span><span class="oc-r"><?= Yii::t('structure', 'role-director') ?></span></div>
                                            <div class="oc-node oc-blk oc-green oc-drop "><?= Yii::t('structure', 'blk-capital') ?><span class="oc-chev"></span></div>
                                            <div class="oc-sub">
                                                <div class="oc-sub-inner">
                                                <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-capital-policy') ?></div>
                                                <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-capital-sup') ?></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="oc-col">
                                            <div class="oc-node oc-dirbox oc-dir" id="oc_d_terlan"><span class="oc-n"><?= Yii::t('structure', 'dir-terlan') ?></span><span class="oc-r"><?= Yii::t('structure', 'role-director') ?></span></div>
                                            <div class="oc-node oc-blk oc-green oc-drop "><?= Yii::t('structure', 'blk-reserve') ?><span class="oc-chev"></span></div>
                                            <div class="oc-sub">
                                                <div class="oc-sub-inner">
                                                <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-fx-reserve') ?></div>
                                                <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-market-ops') ?></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- G4: Vüsal Cahangir -->
                                <div class="oc-grp">
                                    <div class="oc-depslot">
                                        <div class="oc-node oc-dep oc-blue oc-norm" id="oc_dep4">
                                            <div class="oc-n"><?= Yii::t('structure', 'dep4-name') ?></div>
                                            <div class="oc-t"><?= Yii::t('structure', 'dep-title') ?></div>
                                        </div>
                                    </div>
                                    <div class="oc-cols">
                                        <div class="oc-col">
                                            <div class="oc-node oc-dirbox oc-dir" id="oc_d_sadiq" style="padding-left:0px;padding-right:0px;"><span class="oc-n"><?= Yii::t('structure', 'dir-sadiq') ?></span><span class="oc-r"><?= Yii::t('structure', 'role-director') ?></span></div>
                                            <div class="oc-node oc-blk oc-green oc-drop "><?= Yii::t('structure', 'blk-tech') ?><span class="oc-chev"></span></div>
                                            <div class="oc-sub">
                                                <div class="oc-sub-inner">
                                                <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-fintech') ?></div>
                                                <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-it-ops') ?></div>
                                                <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-digital-eng') ?></div>
                                                <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-data') ?></div>
                                                <div class="oc-node oc-dept oc-deptbox oc-dept-t"><?= Yii::t('structure', 'dep-it-mgmt') ?></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="oc-col">
                                            <div class="oc-node oc-dir" style="visibility:hidden;" aria-hidden="true"></div>
                                            <div class="oc-node oc-blk oc-green oc-drop " id="oc_d_odenis"><?= Yii::t('structure', 'blk-payment') ?><span class="oc-chev"></span></div>
                                            <div class="oc-sub">
                                                <div class="oc-sub-inner">
                                                <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-payment-oversight') ?></div>
                                                <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-payment-dev') ?></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- G5: Gülər -->
                                <div class="oc-grp">
                                    <div class="oc-depslot">
                                        <div class="oc-node oc-dep oc-blue oc-norm" id="oc_dep5">
                                            <div class="oc-n"><?= Yii::t('structure', 'dep5-name') ?></div>
                                            <div class="oc-t"><?= Yii::t('structure', 'dep-title') ?></div>
                                        </div>
                                    </div>
                                    <div class="oc-cols" style="align-items:flex-start;">
                                        <div class="oc-col">
                                            <div class="oc-node oc-dirbox oc-dir" id="oc_d_tural"><span class="oc-n"><?= Yii::t('structure', 'dir-tural') ?></span><span class="oc-r"><?= Yii::t('structure', 'role-director') ?></span></div>
                                            <div class="oc-node oc-blk oc-green oc-drop "><?= Yii::t('structure', 'blk-operations') ?><span class="oc-chev"></span></div>
                                            <div class="oc-sub">
                                                <div class="oc-sub-inner">
                                                <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-cash') ?></div>
                                                <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-treasury') ?></div>
                                                <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-consumer') ?></div>
                                                <div class="oc-node oc-dept oc-deptbox oc-dept-y"><?= Yii::t('structure', 'dep-regional') ?></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="oc-col">
                                            <div class="oc-node oc-dirbox oc-dir" id="oc_d_resad"><span class="oc-n"><?= Yii::t('structure', 'dir-resad') ?></span><span class="oc-r"><?= Yii::t('structure', 'role-director') ?></span></div>
                                            <div class="oc-node oc-blk oc-green oc-drop "><?= Yii::t('structure', 'blk-legal') ?><span class="oc-chev"></span></div>
                                            <div class="oc-sub">
                                                <div class="oc-sub-inner">
                                                <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-fin-legal') ?></div>
                                                <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-legal-org') ?></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="oc-col" style="width:auto;">
                                            <div class="oc-node oc-dirbox oc-dir" id="oc_d_anar" style="width:60px;"><span class="oc-n"><?= Yii::t('structure', 'dir-anar') ?></span><span class="oc-r"><?= Yii::t('structure', 'role-director') ?></span></div>
                                            <div class="oc-deptgrid">
                                                <div class="oc-deptcol">
                                                    <div class="oc-node oc-inkisaf oc-drop " id="oc_inkisaf"><?= Yii::t('structure', 'blk-orgdev') ?><span class="oc-chev"></span></div>
                                                    <div class="oc-sub oc-sub-ink">
                                                        <div class="oc-sub-inner">
                                                        <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-fin-mgmt') ?></div>
                                                        <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-risk') ?></div>
                                                        <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-admin') ?></div>
                                                        <div class="oc-node oc-dept oc-deptbox"><?= Yii::t('structure', 'dep-procurement') ?></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="oc-deptcol">
                                                    <div class="oc-node oc-inkisaf" style="visibility:hidden;" aria-hidden="true"><?= Yii::t('structure', 'blk-orgdev') ?></div>
                                                    <div class="oc-node oc-dept oc-deptbox" id="oc_dp2"><?= Yii::t('structure', 'dep-hr') ?></div>
                                                    <div class="oc-node oc-dept oc-deptbox" id="oc_dp4" style="min-height:60px;"><?= Yii::t('structure', 'dep-strategy') ?></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div class="oc-note"><?= Yii::t('structure', 'footnote-curator') ?></div>
                    </div>

                    <div class="oc-mobile-img">
                        <img src="/images/structure_<?= Yii::$app->language === 'en' ? 'en' : 'az' ?>.png" alt="Structure">
                    </div>

                    <script>
                    (function(){
                        var oc=document.getElementById('oc_root');
                        var svg=document.getElementById('oc_lines');
                        if(!oc||!svg) return;
                        var C='#c9ced3';
                        function R(id){var e=document.getElementById(id);var b=e.getBoundingClientRect();var p=oc.getBoundingClientRect();
                            return {l:b.left-p.left,t:b.top-p.top,r:b.right-p.left,b:b.bottom-p.top,
                                    cx:(b.left+b.right)/2-p.left,cy:(b.top+b.bottom)/2-p.top};}
                        var lines=[];
                        function ln(x1,y1,x2,y2){lines.push('<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+C+'" stroke-width="1" shape-rendering="crispEdges"/>');}
                        function downBus(pid,cids,gap){
                            var P=R(pid),cs=cids.map(R);
                            var busY=Math.min.apply(null,cs.map(function(c){return c.t;}))-(gap||18);
                            ln(P.cx,P.b,P.cx,busY);
                            var xs=cs.map(function(c){return c.cx;}).concat(P.cx);
                            ln(Math.min.apply(null,xs),busY,Math.max.apply(null,xs),busY);
                            cs.forEach(function(c){ln(c.cx,busY,c.cx,c.t);});
                        }
                        function rightBracket(pid,cids){
                            var P=R(pid),cs=cids.map(R);
                            var spineX=Math.min.apply(null,cs.map(function(c){return c.l;}))-30;
                            ln(P.r,P.cy,spineX,P.cy);
                            ln(spineX,cs[0].cy,spineX,cs[cs.length-1].cy);
                            cs.forEach(function(c){ln(spineX,c.cy,c.l,c.cy);});
                        }
                        // line from a deputy's right side -> far-right spine -> into the right-column dept boxes
                        function deptSpine(fromId,rightIds){
                            var P=R(fromId),r=rightIds.map(R);
                            var spineX=Math.max.apply(null,r.map(function(c){return c.r;}))+12;
                            ln(P.r,P.cy,spineX,P.cy);
                            ln(spineX,P.cy,spineX,r[r.length-1].cy);
                            r.forEach(function(c){ln(spineX,c.cy,c.r,c.cy);});
                        }
                        // chairman: line to the left, then straight down to a far-left child
                        function leftDown(pid,cid){
                            var P=R(pid),c=R(cid);
                            ln(P.l,P.cy,c.cx,P.cy);
                            ln(c.cx,P.cy,c.cx,c.t);
                        }
                        // shift a deputy box so it is centred over its director children
                        function centerDep(depId,childIds){
                            var el=document.getElementById(depId);
                            el.style.transform='';
                            var d=R(depId),cs=childIds.map(R);
                            var target=(Math.min.apply(null,cs.map(function(c){return c.l;}))+Math.max.apply(null,cs.map(function(c){return c.r;})))/2;
                            el.style.transform='translateX('+(target-d.cx)+'px)';
                        }
                        // parent's right side -> bus -> down to children (used for Əliyar -> Toğrul, Əli)
                        function rightChildren(pid,cids){
                            var P=R(pid),cs=cids.map(R);
                            var busY=P.cy;
                            var maxX=Math.max.apply(null,cs.map(function(c){return c.cx;}));
                            ln(P.r,busY,maxX,busY);
                            cs.forEach(function(c){ln(c.cx,busY,c.cx,c.t);});
                        }
                        function draw(){
                            lines=[];
                            svg.setAttribute('viewBox','0 0 '+oc.offsetWidth+' '+oc.offsetHeight);
                            centerDep('oc_dep5',['oc_d_tural','oc_d_resad','oc_d_anar']);
                            downBus('oc_chair',['oc_dep1','oc_dep4','oc_dep5'],22);
                            rightChildren('oc_dep1',['oc_dep2','oc_dep3']);
                            rightBracket('oc_chair',['oc_s1','oc_s2','oc_s3','oc_s4','oc_s5']);
                            leftDown('oc_chair','oc_d_vuqar');
                            downBus('oc_dep1',['oc_d_vusalc','oc_d_sahin'],16);
                            downBus('oc_dep2',['oc_d_fuad'],16);
                            downBus('oc_dep3',['oc_d_elrad','oc_d_terlan'],16);
                            downBus('oc_dep4',['oc_d_sadiq','oc_d_odenis'],16);
                            downBus('oc_dep5',['oc_d_tural','oc_d_resad','oc_d_anar'],16);
                            deptSpine('oc_dep5',['oc_dp2','oc_dp4']);
                            svg.innerHTML=lines.join('');
                        }
                        // dropdown toggles for green blocks
                        Array.prototype.forEach.call(oc.querySelectorAll('.oc-drop'), function(b){
                            b.addEventListener('click', function(){
                                b.classList.toggle('oc-open');
                                draw();
                            });
                        });
                        window.addEventListener('load',draw);
                        window.addEventListener('resize',draw);
                        if(window.ResizeObserver){ new ResizeObserver(draw).observe(oc); }
                        setTimeout(draw,80);
                        setTimeout(draw,400);
                    })();
                    </script>
                    <!-- ===== ORG CHART END ===== -->
