set_variables = () => {
    window.viewer = OpenSeadragon({
        id: 'osd',
        prefixUrl: 'openseadragon/images/',
        tileSources: 'map_blank.dzi',
        navigationControlAnchor: OpenSeadragon.ControlAnchor.TOP_LEFT
    });
    window.highlighted_asset = '';
    window.show_inactive = false;
    window.show_regions = false;
    window.show_faction_table = true;
    window.show_sidebar = false;
    window.menu_on = false;
    window.tip_on = false;
    window.planet_tip_on = false;
    window.system_tip_on = false;
    window.faction_tracker = {};
    window.system_tracker = {};
    window.system_objects = {};
    window.orbital_objects_chart = null;
    window.planet_tracker = null;
    window.planet_objects = {};
    window.planet_objects_chart = null;
    window.asset_tracker = null;
    window.asset_objects = {};
    window.influence_tracker = {};
    window.show_battle_container = false;
    window.attacker_roll_result = null;
    window.defender_roll_result = null;
    window.attacker_advantage = false;
    window.defender_advantage = false;
    window.short_timeout = null;
    window.long_timeout = null;
    window.dir = {influence: -1, faction: -1, name: -1, location: -1};
    window.viewport_w = window.innerWidth;
    window.viewport_h = window.innerHeight;
    window.isFirefox = typeof InstallTrigger !== 'undefined';
    window.svg_overlay = null;
};

window.onload = () => {
    set_variables();
    svg_overlay = viewer.svgOverlay();
    $(window).resize(() => {
        svg_overlay.resize();
        viewport_w = window.innerWidth;
        viewport_h = window.innerHeight;
    });
    viewer.controls.topleft.style.position = 'relative';
    viewer.controls.topleft.style.width = '105px';
    viewer.controls.topleft.style.top = '10px';
    viewer.controls.topleft.style.margin = '0px auto';
    viewer.zoomPerClick = 1;
    viewer.addHandler('open', onViewerOpen());
    viewer.addHandler('canvas-click', (e) => {
        if (e.originalEvent.target.innerText !== 'ATTACKER' && e.originalEvent.target.innerText !== 'DEFENDER') {
            menu_on = false;
            for (let asset in asset_objects) {
                if (hasProp(asset_objects, asset)) {
                    let a = asset_objects[asset];
                    if (a['menu_on']) {
                        a['menu_on'] = false;
                        viewer.removeOverlay('menu');
                    }
                }
            }
        }
    });

    for (let fac in factions) {
        if (factions.hasOwnProperty(fac) && fac !== 'The Guild') {
            let cell = document.getElementById(factions[fac]['short'] + '-cell');
            cell.style.backgroundColor = factions[fac]['color'];
            if (inactive_factions.includes(fac)) {
                cell.innerHTML = '<img src=\'assets_alpha/Inactive.png\' alt=\'\' />';
            }
        }
    }

    window.planet_tip_chart = new ApexCharts(
        document.querySelector('#planet-tip-chart'),
        {
            chart: {
                type: 'donut',
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 100,
                    animateGradually: {
                        enabled: true,
                        delay: 500
                    },
                    dynamicAnimation: {
                        enabled: true,
                        speed: 100
                    }
                },
                fontFamily: 'D-DIN, Helvetica, Arial, sans-serif',
                parentHeightOffset: 15,
                dropShadow: {
                    enabled: false
                }
            },
            title: {
                text: 'Influence',
                align: 'center',
                offsetY: 176,
                floating: true,
                style: {
                    color: '#ffffff',
                    fontWeight: 'bold'
                }
            },
            series: [],
            legend: {
                show: true,
                floating: true,
                position: 'bottom',
                labels: {
                    colors: '#ffffff'
                },
                itemMargin: {
                    horizontal: 5
                }
            },
            stroke: {
                show: true,
                width: 4,
                colors: ['#141414']
            },
            dataLabels: {
                enabled: true,
                style: {
                    fontSize: '16px'
                },
                dropShadow: {
                    enabled: false
                }
            },
            plotOptions: {
                pie: {
                    offsetY: 10,
                    donut: {
                        size: '50%'
                    }
                }
            }
        }
    );
    planet_tip_chart.render();

    window.system_tip_chart_outer = new ApexCharts(
        document.querySelector('#system-tip-chart-outer'),
        {
            chart: {
                type: 'donut'
            },
            title: {
                text: 'Influence',
                align: 'center',
                offsetY: 176,
                floating: true,
                style: {
                    color: '#ffffff',
                    fontWeight: 'bold'
                }
            },
            series: [1],
            legend: {
                show: true,
                floating: true,
                position: 'bottom',
                labels: {
                    colors: '#ffffff'
                },
                itemMargin: {
                    horizontal: 5
                }
            },
            stroke: {
                show: true,
                width: 4,
                colors: ['#141414']
            },
            dataLabels: {
                enabled: true,
                style: {
                    fontSize: '16px'
                },
                dropShadow: {
                    enabled: false
                }
            },
            plotOptions: {
                pie: {
                    offsetY: 10,
                    donut: {
                        size: '60%'
                    }
                }
            }
        }
    );
    system_tip_chart_outer.render();

    window.system_tip_chart_inner = new ApexCharts(
        document.querySelector('#system-tip-chart-inner'),
        {
            chart: {
                type: 'donut'
            },
            series: [],
            legend: {
                show: false
            },
            theme: {
                monochrome: {
                    enabled: true,
                    color: '#222222',
                    shadeIntensity: 0
                }
            },
            stroke: {
                show: true,
                width: 6.6,
                colors: ['#141414']
            },
            dataLabels: {
                enabled: true,
                style: {
                    colors: ['#777777'],
                    fontSize: '12px'
                },
                dropShadow: {
                    enabled: false
                }
            },
            plotOptions: {
                pie: {
                    customScale: 0.62,
                    offsetY: 6,
                    donut: {
                        size: '60%'
                    }
                }
            }
        }
    );
    system_tip_chart_inner.render();

    let tips;
    let x_offset = false;
    let y_offset = false;

    window.onmousemove = function(e) {
        let mouse_x = e.clientX;
        let mouse_y = e.clientY;

        if (tip_on === true || planet_tip_on === true || system_tip_on === true || menu_on === true) {

            tips = [
                document.getElementById('tip'),
                document.getElementById('planet-tip'),
                document.getElementById('system-tip')
            ];

            let tip_h = tips.map(t => t.offsetHeight);
            let scale_h = tip_h.map(h => Math.min(viewport_h / h, 1));
            tips.forEach((t, index) => t.style.transform = `scale(${scale_h[index]})`);

            tips.forEach(t => {
                if (x_offset) {
                    tips.forEach(t => t.style.left = mouse_x - t.offsetWidth - 20 + 'px')
                } else {
                    tips.forEach(t => t.style.left = mouse_x + 20 + 'px');
                }
            });

            if (y_offset) {
                tips.forEach((t, index) => {
                    if (scale_h[index] === 1) {
                        t.style.top = Math.max(mouse_y - t.offsetHeight - 20, 5) + 'px';
                    } else {
                        t.style.top = '0';
                        let rect = t.getBoundingClientRect();
                        t.style.top = `-${rect.top - 1}px`;
                    }
                });
            } else {
                tips.forEach((t, index) => {
                    if (scale_h[index] === 1) {
                        t.style.top = Math.min(mouse_y + 20, viewport_h - t.offsetHeight - 5) + 'px';
                    } else {
                        t.style.top = '0';
                        let rect = t.getBoundingClientRect();
                        t.style.top = `-${rect.top - 1}px`;
                    }
                });
            }

        } else {
            x_offset = mouse_x > viewport_w * 0.5;
            y_offset = mouse_y > viewport_h * 0.5;
        }
    };

    window.sectorinfluence_chart_outer = new ApexCharts(
        document.querySelector('#sectorinfluence-chart-outer'),
        {
            chart: {
                type: 'donut',
                fontFamily: 'D-DIN, Helvetica, Arial, sans-serif',
                parentHeightOffset: 15,
                dropShadow: {
                    enabled: false
                }
            },
            series: [],
            title: {
                style: {
                    color: '#fff'
                }
            },
            legend: {
                show: true,
                floating: true,
                position: 'bottom',
                labels: {
                    colors: '#ffffff'
                },
                itemMargin: {
                    horizontal: 5
                }
            },
            stroke: {
                show: true,
                width: 4,
                colors: ['#141414']
            },
            dataLabels: {
                enabled: true,
                style: {
                    fontSize: '24px'
                },
                dropShadow: {
                    enabled: false
                },
                formatter: val => {
                    if (val > 5) {
                        return Math.round(val * 10) / 10 + '%';
                    } else {
                        return '';
                    }
                }
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '60%'
                    }
                }
            }
        }
    );
    sectorinfluence_chart_outer.render();

    window.sectorinfluence_chart_inner = new ApexCharts(
        document.querySelector('#sectorinfluence-chart-inner'),
        {
            chart: {
                type: 'donut'
            },
            series: [],
            legend: {
                show: false
            },
            theme: {
                monochrome: {
                    enabled: true,
                    color: '#222222',
                    shadeIntensity: 0
                }
            },
            stroke: {
                show: true,
                width: 6.1,
                colors: ['#141414']
            },
            dataLabels: {
                enabled: true,
                style: {
                    colors: ['#777777'],
                    fontSize: '12px',
                    fontWeight: 'bold'
                },
                dropShadow: {
                    enabled: false
                }
            },
            plotOptions: {
                pie: {
                    customScale: 0.65,
                    offsetY: 9,
                    donut: {
                        size: '60%'
                    }
                }
            }
        }
    );
    sectorinfluence_chart_inner.render();
};