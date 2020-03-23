// TODO: REWRITE TO ONLY MAINTAIN 1 TRACKER

class SystemName {
    constructor(id, system, hex) {
        this.id = 'system-' + id.toString().padStart(2, '0');
        this.system_name = system;
        this.hex_id = hex;

        this.hex_x = hexes[this.hex_id]['X'];
        this.hex_y = hexes[this.hex_id]['Y'];

        this.x_offset = 0;
        this.y_offset = -0.046;
        let w_factor = 1;
        let padding;
        let style_str_name;
        let style_str_hex;
        if (isFirefox) {
            style_str_name = 'font-size: 0.02px; font-size-adjust: 0.2';
            style_str_hex = 'font-size: 0.04px; font-size-adjust: 0.2';
            padding = 0.0015;
        } else {
            style_str_name = 'font-size: 0.0056px';
            style_str_hex = 'font-size: 0.013px';
            padding = 0.0005;
        }

        d3.select(svg_overlay.node()).append('svg:text')
            .text(this.hex_id.replace('hex-', ''))
            .attr('style', style_str_hex)
            .attr('id', this.id + '-hex')
            .attr('class', 'system-name')
            .attr('font-family', 'D-DIN')
            .attr('fill', '#7c7c7c')
            .attr('text-anchor', 'middle')
            .attr('x', this.hex_x)
            .attr('y', this.hex_y + 0.05);
        this.hexText = getElem(this.id + '-hex');

        if (this.system_name !== '') {

            this.num_planets = system_tracker[system]['num_planets'];

            let system_name_SVG = d3.select(svg_overlay.node()).append('svg:text')
                .text(this.system_name.toUpperCase())
                .attr('style', style_str_name)
                .attr('id', this.id + '-name')
                .attr('class', 'system-name')
                .attr('font-family', 'D-DIN')
                .attr('fill', '#7c7c7c')
                .attr('text-anchor', 'middle')
                .attr('x', this.hex_x + this.x_offset)
                .attr('y', this.hex_y + this.y_offset);
            this.text = getElem(this.id + '-name');
            let box_width = system_name_SVG.node().getComputedTextLength();

            new SystemNameHighlight(
                this.id + '-highlight',
                this.hex_x,
                this.hex_y,
                this.x_offset,
                this.y_offset,
                w_factor,
                box_width,
                padding
            );
            this.highlight_box = viewer.getOverlayById(this.id + '-highlight');

            // noinspection JSUnusedLocalSymbols
            new OpenSeadragon.MouseTracker({
                element: this.id + '-highlight',
                enterHandler: () => {
                    if (!menu_on) {
                        getElem('system-tip-name').innerHTML = `<b>${this.system_name}</b>`;
                        getElem('system-tip-hex').innerHTML = `<b>${this.hex_id.replace('hex-', '')}</b>`;
                        getElem('system-tip').style.display = 'block';
                        getElem('system-tip').style.zIndex = '3';

                        system_tip_on = true;
                        updateSystemChart(this.system_name);

                        let orbital_objects_chart_config = {
                            chart: {
                                container: '#orbital-objects-chart-container',
                                rootOrientation: 'WEST', // NORTH || EAST || WEST || SOUTH
                                levelSeparation: 20,
                                siblingSeparation: 5,
                                subTeeSeparation: 10,
                                nodeAlign: 'BOTTOM',
                                scrollbar: 'None',
                                connectors: {
                                    type: 'step',
                                    style: {
                                        'arrow-end': 'block-wide-long',
                                        'stroke-width': 1,
                                        'stroke-linecap': 'round',
                                        'stroke-dasharray': '. ',
                                        'stroke': '#777'
                                    }
                                },
                                node: {
                                    HTMLclass: 'system-object'
                                }
                            },
                            nodeStructure: orbital_objects[this.system_name]
                        };
                        orbital_objects_chart = new Treant(orbital_objects_chart_config);
                        resizeSystemTip();
                    }
                },
                exitHandler: () => {
                    if (!menu_on) {
                        getElem('system-tip').style.display = 'none';
                        system_tip_on = false;
                        orbital_objects_chart.destroy();
                    }
                },
                clickHandler: () => {
                    window.open('https://far-verona.fandom.com/wiki/' + this.system_name);
                }
            });
        }
    }

    hide(bool) {
        this.hidden = bool;
        if (this.hidden) {
            this.text.style.display = 'none';
            this.highlight_box.style.display = 'none';
        } else {
            this.text.style.display = 'block';
            this.highlight_box.style.display = 'block';
        }
    }

    color(color) {
        this.text.style.fill = color;
    }

    hexColor(color) {
        this.hexText.style.fill = color;
    }
}

class SystemNameHighlight {
    constructor(id, hex_x, hex_y, x_offset, y_offset, w_factor, box_width, padding) {
        this.id = id;
        let highlight = document.createElement('div');
        highlight.id = this.id;
        highlight.className = 'highlight';
        highlight.style.cursor = 'pointer';

        viewer.addOverlay({
            element: highlight,
            location: new OpenSeadragon.Rect(
                hex_x + x_offset - (w_factor * box_width) / 2 - padding,
                hex_y + y_offset - 0.005,
                (box_width + 2 * padding) * w_factor,
                0.006
            )
        });
    }
}

class PlanetName {
    constructor(id, planet) {
        this.planet = planet;
        this.id = 'planet-' + id.toString().padStart(2, '0');
        this.hex_id = 'hex-' + planet['Hex'];
        this.system_name = planet['System'];
        this.planet_name = planet['Name'];
        this.pgov = planet['Planetary Government'];
        this.hw = planet['Homeworld'];
        this.tl = planet['TL'];
        this.pop = planet['Population'];
        this.atmo = planet['Atmosphere'];
        this.temp = planet['Temperature'];
        this.bio = planet['Biosphere'];
        this.pcvi = planet['PCVI'];
        this.tags = planet['Tags'].join(', ');

        this.hex_x = hexes[this.hex_id]['X'];
        this.hex_y = hexes[this.hex_id]['Y'];
        this.current_idx = planet['idx'];
        this.num_planets = planet['total'];
        this.x_offset = planet_to_hex_offsets[this.num_planets][this.current_idx]['X'];
        this.y_offset = planet_to_hex_offsets[this.num_planets][this.current_idx]['Y'];

        this.hidden = false;
        this.text_color = '#7c7c7c';
        this.box_color = '#222222';
        let font_weight = 'normal';
        let w_factor = 1;
        let hw_str = '';
        let owner_str = 'Unclaimed';
        if (this.pgov !== '') {
            this.text_color = factions[this.pgov]['text'];
            this.box_color = factions[this.pgov]['color'];
            owner_str = this.pgov;
        }
        if (this.pgov === this.hw && this.pgov !== '') {
            font_weight = 'bold';
            w_factor = 0.98;
            hw_str = ' (Homeworld)';
        }
        let padding;
        let style_str;
        if (isFirefox) {
            style_str = 'font-size: 0.01px; font-size-adjust: 0.1';
            padding = 0.0015;
        } else {
            style_str = 'font-size: 0.0035px';
            padding = 0.0005;
        }

        let circle_color = '#404040';
        if (this.hex_id === 'hex-0808') {
            circle_color = factions['The Guild']['color'];
        }

        d3.select(svg_overlay.node())
            .insert('circle', '.asset')
            .attr('id', this.id + '-circle')
            .attr('class', 'planet')
            .attr('fill', 'rgba(255,255,255,0)')
            // .attr('fill', '#222222')
            .attr('stroke', circle_color)
            .style('stroke-width', 0.00065)
            .attr('cx', this.hex_x + this.x_offset)
            .attr('cy', this.hex_y + this.y_offset)
            .attr('r', 0.011);
        this.circle = getElem(this.id + '-circle');

        let planet_name_SVG = d3
            .select(svg_overlay.node())
            .append('svg:text')
            .text(this.planet_name.toUpperCase())
            .attr('style', style_str)
            .attr('id', this.id + '-name')
            .attr('class', 'planet')
            .attr('font-family', 'D-DIN')
            .attr('font-weight', font_weight)
            .attr('fill', this.text_color)
            .attr('text-anchor', 'middle')
            .attr('x', this.hex_x + this.x_offset)
            .attr('y', this.hex_y + this.y_offset + 0.011)
            .attr('pointer-events', 'none');
        this.text = getElem(this.id + '-name');
        let box_width = planet_name_SVG.node().getComputedTextLength();
        d3.select(svg_overlay.node())
            .insert('rect', '#' + this.id + '-name')
            .attr('id', this.id + '-color')
            .attr('class', 'planet')
            .attr('fill', this.box_color)
            .attr('x', this.hex_x + this.x_offset - (w_factor * box_width) / 2 - padding)
            .attr('y', this.hex_y + this.y_offset + 0.00812)
            .attr('width', (box_width + 2 * padding) * w_factor)
            .attr('height', 0.0034)
            .attr('pointer-events', 'none');
        this.color_box = getElem(this.id + '-color');

        new PlanetNameHighlight(
            this.id + '-highlight',
            this.hex_x,
            this.hex_y,
            this.x_offset,
            this.y_offset,
            w_factor,
            box_width,
            padding
        );
        this.highlight_box = viewer.getOverlayById(this.id + '-highlight');

        // noinspection JSUnusedLocalSymbols
        new OpenSeadragon.MouseTracker({
            element: this.id + '-highlight',
            enterHandler: () => {
                if (!menu_on) {
                    let display_name = this.planet_name;
                    getElem('planet-tip-name').innerHTML = display_name;
                    getElem('planet-tip-sys').innerHTML = this.hex_id.replace('hex-', '') + ' / ' + this.system_name;
                    getElem('planet-tip').style.display = 'block';
                    getElem('planet-tip').style.zIndex = '3';
                    planet_tip_on = true;

                    if (this.planet_name === 'The Guild Dyson Sphere') {
                        getElem('planet-tip-atmo').style.transform = `rotate(${(Math.random() * 2 - 1) * 15}deg)`;
                        getElem('planet-tip-temp').style.transform = `rotate(${(Math.random() * 2 - 1) * 15}deg)`;
                        getElem('planet-tip-bio').style.transform = `rotate(${(Math.random() * 2 - 1) * 15}deg)`;
                        getElem('planet-tip-tl').style.transform = `rotate(${(Math.random() * 2 - 1) * 15}deg)`;
                        getElem('planet-tip-pop').style.transform = `rotate(${(Math.random() * 2 - 1) * 15}deg)`;
                        getElem('planet-tip-tags').style.transform = `rotate(${(Math.random() * 2 - 1) * 5}deg)`;
                        this.tags = 'tags more like HAX amirite';
                        this.atmo = 'chill';
                        this.temp = 'fever';
                        this.bio = 'sexy af';
                        this.tl = '9001';
                        this.pop = 'ok boomer';
                        this.pcvi = ['u wot m8', 'u wot m8'];
                        let options = {
                            labels: ['The Guild'],
                            colors: ['#FD3F6D'],
                            dataLabels: {
                                formatter: () => {
                                    return '420.0%';
                                },
                                style: {
                                    colors: ['#ffffff']
                                }
                            }
                        };
                        planet_tip_chart.updateSeries([1312]);
                        updatePlanetChartOptions(options, 6969);
                    } else {
                        getElem('planet-tip-atmo').style.transform = `rotate(0deg)`;
                        getElem('planet-tip-temp').style.transform = `rotate(0deg)`;
                        getElem('planet-tip-bio').style.transform = `rotate(0deg)`;
                        getElem('planet-tip-tl').style.transform = `rotate(0deg)`;
                        getElem('planet-tip-pop').style.transform = `rotate(0deg)`;
                        getElem('planet-tip-tags').style.transform = `rotate(0deg)`;
                        updatePlanetChart(this.planet_name);
                    }
                    getElem('planet-tip-atmo').innerHTML = this.atmo;
                    getElem('planet-tip-temp').innerHTML = this.temp;
                    getElem('planet-tip-bio').innerHTML = this.bio;
                    getElem('planet-tip-tl').innerHTML = this.tl;
                    getElem('planet-tip-pcvi').innerHTML = this.pcvi[0] !== this.pcvi[1] ? `${this.pcvi[1]} (${this.pcvi[0]})` : this.pcvi[0];
                    getElem('planet-tip-pop').innerHTML = this.pop;
                    getElem('planet-tip-tags').innerHTML = this.tags;
                    replaceInactiveFactionNames(this.planet_name, owner_str, hw_str);

                    let planet_tree = orbital_objects[this.system_name]['children'].filter(child => child['text']['name'] === this.planet_name)[0];
                    if (hasProp(planet_tree, 'children')) {
                        let planet_objects_chart_config = {
                            chart: {
                                container: '#planet-objects-chart-container',
                                rootOrientation: 'WEST', // NORTH || EAST || WEST || SOUTH
                                levelSeparation: 20,
                                siblingSeparation: 5,
                                subTeeSeparation: 10,
                                nodeAlign: 'BOTTOM',
                                scrollbar: 'None',
                                connectors: {
                                    type: 'step',
                                    style: {
                                        'arrow-end': 'block-wide-long',
                                        'stroke-width': 1,
                                        'stroke-linecap': 'round',
                                        'stroke-dasharray': '. ',
                                        'stroke': '#777'
                                    }
                                },
                                node: {
                                    HTMLclass: 'system-object'
                                }
                            },
                            nodeStructure: orbital_objects[this.system_name]['children'].filter(child => child['text']['name'] === this.planet_name)[0]
                        };
                        planet_objects_chart = new Treant(planet_objects_chart_config);
                    }
                }
            },
            exitHandler: () => {
                if (!menu_on) {
                    getElem('planet-tip').style.display = 'none';
                    planet_tip_on = false;
                    let planet_tree = orbital_objects[this.system_name]['children'].filter(child => child['text']['name'] === this.planet_name)[0];
                    if (hasProp(planet_tree, 'children')) {
                        planet_objects_chart.destroy();
                    }
                }
            },
            clickHandler: () => {
                window.open('https://far-verona.fandom.com/wiki/' + this.planet_name);
            }
        });
    }

    color(text_color, box_color) {
        this.text.setAttribute('fill', text_color);
        this.color_box.setAttribute('fill', box_color);
    }

    circleColor(color) {
        this.circle.style.stroke = color;
    }

    fontweight(weight) {
        this.text.setAttribute('font-weight', weight);
    }

    hide(bool) {
        this.hidden = bool;
        if (this.hidden) {
            this.text.style.display = 'none';
            this.highlight_box.style.display = 'none';
            this.color_box.style.display = 'none';
        } else {
            this.text.style.display = 'block';
            this.highlight_box.style.display = 'block';
            this.color_box.style.display = 'block';
        }
    }

    pos() {
        return [this.hex_x + this.x_offset, this.hex_y + this.y_offset];
    }
}

class PlanetNameHighlight {
    constructor(id, hex_x, hex_y, x_offset, y_offset, w_factor, box_width, padding) {
        this.id = id;
        let highlight = document.createElement('div');
        highlight.id = this.id;
        highlight.className = 'highlight';
        highlight.style.cursor = 'pointer';

        viewer.addOverlay({
            element: highlight,
            location: new OpenSeadragon.Rect(
                hex_x + x_offset - (w_factor * box_width) / 2 - padding,
                hex_y + y_offset + 0.00812,
                (box_width + 2 * padding) * w_factor,
                0.0034
            )
        });
    }
}

class Asset {
    constructor(id, asset, hex_id, pos, location) {
        this.id = id;
        this.name = asset['Asset'];
        this.isboi = this.name === 'Base Of Influence';
        this.faction = asset['Owner'];
        this.hp = asset['HP'];
        this.max_hp = asset['Max HP'];
        this.stealth = asset['ʘ'] !== 'FALSE';
        this.status = asset['Status'];
        this.status_str = statuses[this.status];
        this.inactive = this.status === 'Inactive';
        this.summoning = this.status === 'Summoning';
        this.imperial = this.status === 'Imperial Asset';
        this.name_str = this.name;
        if (this.imperial) {
            this.name_str = `Imperial ${this.name_str}`;
        }
        if (this.stealth) {
            this.name_str = `<mark>${this.name_str}</mark>`;
        }
        this.type = this.isboi ? '' : asset['Type'];
        this.cost = this.isboi ? 'Special' : asset['Cost'] !== 'n/a' ? asset['Cost'] : '-';
        this.tl = this.isboi ? '-' : assets[this.name]['TL'] !== 'n/a' ? assets[this.name]['TL'] : '-';
        this.atk = this.isboi ? '-' : asset['Attack'].replace('None', '-');
        this.def = this.isboi ? '-' : asset['Counter'].replace('None', '-');
        this.stat = this.isboi ? '' : asset['W/C/F'];
        this.stat_tier = this.isboi ? '-' : assets[this.name]['STAT_TIER'];
        this.perm = this.isboi ? '' : assets[this.name]['PERM'] !== '' ? 'Needs governmental permission.' : '';
        this.special = this.isboi ? '' : assets[this.name]['SPECIAL'];
        this.range = this.isboi ? 0 : assets[this.name]['RANGE'];
        if (!this.isboi && this.range === 0 && faction_tracker[this.faction]['Tag'] === 'Mercenary Group') {
            this.range = 1;
        }
        this.hex_id = hex_id;
        this.x = pos['asset']['X'];
        this.y = pos['asset']['Y'];
        this.size = box_size / 1.1;
        this.location = location;
        this.menu_on = false;
        this.menu;

        // Create asset pool entry
        createAssetPoolEntry(this);

        // Highlight range of movement assets
        this.highlightHexes = function(hex_id, range) {
            let hex_list = hexes[hex_id][range];
            hex_list.forEach(h => {
                if (!show_regions) {
                    getElem(h).style.fill = '#ffffff';
                    getElem(h).style.opacity = '0.05';
                }
            });
        };

        // Draw routes
        this.drawRoutes = function(hex_id, range) {
            let hex_list = hexes[hex_id][range];
            hex_list.forEach(h => {
                if (hasProp(hexes[h], 'Name')) {
                    let system = hexes[h]['Name'];
                    let planets = system_tracker[system]['Planets'];
                    for (let planet_id in planet_objects) {
                        if (hasProp(planet_objects, planet_id)) {
                            let remote_name = planet_objects[planet_id]['planet_name'];
                            if (planets.indexOf(remote_name) > -1 && remote_name !== this.location.split(' // ')[2]) {
                                let [target_x, target_y] = planet_objects[planet_id].pos();
                                let source_x = this.x + this.size / 2;
                                let source_y = this.y + this.size / 2;
                                let angle = Math.atan2(target_y - source_y, target_x - source_x) * 180 / Math.PI;
                                let link;
                                if ((angle <= 45 && angle >= -45) || (angle >= 135 && angle <= -135)) {
                                    link = d3.linkHorizontal();
                                } else {
                                    link = d3.linkVertical();
                                }

                                let path = {
                                    source: [this.x + this.size / 2, this.y + this.size / 2],
                                    target: [target_x, target_y]
                                };
                                d3.select(svg_overlay.node())
                                    .insert('path', '.planet')
                                    .attr('class', 'nav-route')
                                    .attr('d', link(path))
                                    .attr('fill', 'rgba(255,255,255,0)')
                                    .attr('stroke', '#7c7c7c')
                                    .style('stroke-width', 0.00065)
                                    .style('opacity', 0);

                                let nav_routes = document.getElementsByClassName('nav-route');
                                [...nav_routes].forEach(nav => {
                                    nav.style.opacity = 1;
                                });
                            }
                        }
                    }
                }
            });
        };

        // Render asset
        d3.select(svg_overlay.node())
            .append('g')
            .attr('id', this.id + '-container')
            .attr('class', 'asset asset-container ' + factions[this.faction]['short'].toLowerCase())
            .attr('width', this.size)
            .attr('height', this.size);
        this.container = getElem(this.id + '-container')
        ;
        d3.select(this.container)
            .append('rect')
            .attr('id', this.id + '-color')
            .attr('class', 'asset ' + factions[this.faction]['short'].toLowerCase())
            .attr('fill', factions[this.faction]['color'])
            .attr('width', this.size)
            .attr('height', this.size);
        this.color_box = getElem(this.id + '-color');

        d3.select(this.container)
            .append('svg:image')
            .attr('id', this.id + '-alpha')
            .attr('class', 'asset ' + factions[this.faction]['short'].toLowerCase())
            .attr('xlink:href', 'assets_alpha/' + this.name + '.png')
            .attr('width', this.size)
            .attr('height', this.size);
        this.alpha_box = getElem(this.id + '-alpha');
        if (this.summoning) {
            this.alpha_box.style.opacity = '0.5';
        }

        if (this.stealth) {
            d3.select(this.container)
                .append('svg:image')
                .attr('id', this.id + '-stealth')
                .attr('class', 'asset ' + factions[this.faction]['short'].toLowerCase())
                .attr('xlink:href', 'assets_alpha/Stealth.png')
                .attr('width', this.size)
                .attr('height', this.size);
        }
        this.stealth_box = getElem(this.id + '-stealth');

        if (this.imperial) {
            d3.select(this.container)
                .append('svg:image')
                .attr('id', this.id + '-imperial')
                .attr('class', 'asset ' + factions[this.faction]['short'].toLowerCase())
                .attr('xlink:href', 'assets_alpha/Imperial.png')
                .attr('width', this.size)
                .attr('height', this.size);
        }
        this.imperial_box = getElem(this.id + '-imperial');

        if (isInactive(this.faction)) {
            d3.select(this.container)
                .append('svg:image')
                .attr('id', this.id + '-inactive')
                .attr('class', 'asset ' + factions[this.faction]['short'].toLowerCase())
                .attr('xlink:href', 'assets_alpha/Inactive.png')
                .attr('width', this.size)
                .attr('height', this.size);
        }
        this.inactive_box = getElem(this.id + '-inactive');

        // Add highlight
        new AssetHighlight(this.id, this.faction, pos['highlight']['X'], pos['highlight']['Y']);
        this.highlight_box = viewer.getOverlayById(id + '-highlight');

        // Get tooltip
        const hex_overlays = document.getElementsByClassName('hex');

        // noinspection JSCheckFunctionSignatures
        new OpenSeadragon.MouseTracker({
            element: id + '-highlight',
            enterHandler: () => {

                getElem('tip-fac').innerHTML = this.faction;
                getElem('tip-stats').innerHTML = this.isboi ? '' : this.type + ', ' + this.stat + ' ' + this.stat_tier;
                getElem('tip-name').innerHTML = this.name_str;
                getElem('tip-hp').innerHTML = this.hp + '/' + this.max_hp;
                getElem('tip-cost').innerHTML = this.cost;
                getElem('tip-tl').innerHTML = this.tl;
                getElem('tip-atk').innerHTML = this.atk;
                getElem('tip-def').innerHTML = this.def;
                getElem('tip-special').innerHTML = this.special;
                getElem('tip-status-label').innerHTML = `<b>${this.status}</b>`;
                getElem('tip-status').innerHTML = this.status_str;
                getElem('tip-perm').innerHTML = '<i>' + this.perm + '</i>';

                if (!menu_on) {
                    if (this.stealth) {
                        getElem('tip-row-stealth').style.display = 'table-row';
                    } else {
                        getElem('tip-row-stealth').style.display = 'none';
                    }
                    if (this.special !== '') {
                        getElem('tip-row-special').style.display = 'table-row';
                    } else {
                        getElem('tip-row-special').style.display = 'none';
                    }
                    if (this.status !== '') {
                        getElem('tip-row-status').style.display = 'table-row';
                    } else {
                        getElem('tip-row-status').style.display = 'none';
                    }
                    if (this.perm !== '') {

                        getElem('tip-row-perm').style.display = 'table-row';
                    } else {
                        getElem('tip-row-perm').style.display = 'none';
                    }

                    getElem('tip').style.display = 'block';
                    tip_on = true;

                    if (this.range > 0) {
                        this.highlightHexes(this.hex_id, this.range);
                        // this.drawRoutes(this.hex_id, this.range);
                    }
                }
            },
            exitHandler: () => {
                getElem('tip').style.display = 'none';
                getElem('tip-fac').innerHTML = '';
                getElem('tip-stats').innerHTML = '';
                getElem('tip-name').innerHTML = '';
                getElem('tip-hp').innerHTML = '';
                getElem('tip-cost').innerHTML = '';
                getElem('tip-tl').innerHTML = '';
                getElem('tip-atk').innerHTML = '';
                getElem('tip-def').innerHTML = '';
                getElem('tip-special').innerHTML = '';
                getElem('tip-perm').innerHTML = '';
                tip_on = false;
                if (!show_regions) {
                    [...hex_overlays].forEach(h => {
                        h.style.opacity = '0';
                    });
                }
                // let nav_routes = document.getElementsByClassName('nav_route');
                // [...nav_routes].forEach(nav => {
                //     nav.remove();
                // });
            },
            clickHandler: () => {

                if (menu_on && this.menu_on) {
                    menu_on = false;
                    this.menu_on = false;
                    this.menu = undefined;
                    let old_menu = getElem('menu');
                    if (old_menu) {
                        viewer.removeOverlay('menu');
                    }
                    if (!tip_on) {
                        tip_on = true;
                        $('#tip').fadeIn(200);
                    }
                } else if (menu_on && !this.menu_on) {
                    if (tip_on) {
                        tip_on = false;
                        $('#tip').fadeOut(200);
                    }
                    this.menu_on = true;
                    let old_menu = getElem('menu');
                    if (old_menu) {
                        viewer.removeOverlay('menu');
                    }
                    for (let asset in asset_objects) {
                        if (hasProp(asset_objects, asset)) {
                            let a = asset_objects[asset];
                            if (a['id'] !== this.id) {
                                a['menu_on'] = false;
                            }
                        }
                    }
                    let atk_row;
                    if (this.atk !== '-') {
                        atk_row = `<td class="hover" onclick="toBattleSlot(\'${this.id}\', \'attacker\')">`;
                    } else {
                        atk_row = '<td class="inactive">';
                    }
                    let menu = document.createElement('div');
                    menu.id = 'menu';
                    menu.innerHTML =
                        '<div id="menu-arrow"></div>' +
                        '<table width="100%">' +
                        '<tr>' +
                        atk_row +
                        '<b>ATTACKER</b>' +
                        '</td>' +
                        '</tr>' +
                        '<tr>' +
                        `<td class="hover" onclick="toBattleSlot(\'${this.id}\', \'defender\')">` +
                        '<b>DEFENDER</b>' +
                        '</td>' +
                        '</tr>' +
                        '</table>';

                    viewer.addOverlay({
                        element: menu,
                        location: new OpenSeadragon.Point(this.x + 0.5 * box_size, this.y + 0.5 * box_size),
                        checkResize: false
                    });

                    this.menu = viewer.getOverlayById('menu');
                } else {
                    if (tip_on) {
                        tip_on = false;
                        $('#tip').fadeOut(200);
                    }
                    menu_on = true;
                    this.menu_on = true;
                    let old_menu = getElem('menu');
                    if (old_menu) {
                        viewer.removeOverlay('menu');
                    }
                    let atk_row;
                    if (this.atk !== '-') {
                        atk_row = `<td class="hover" onclick="toBattleSlot(\'${this.id}\', \'attacker\')">`;
                    } else {
                        atk_row = '<td class="inactive">';
                    }
                    let menu = document.createElement('div');
                    menu.id = 'menu';
                    menu.innerHTML =
                        '<div id="menu-arrow"></div>' +
                        '<table width="100%">' +
                        '<tr>' +
                        atk_row +
                        '<b>ATTACKER</b>' +
                        '</td>' +
                        '</tr>' +
                        '<tr>' +
                        `<td class="hover" onclick="toBattleSlot(\'${this.id}\', \'defender\')">` +
                        '<b>DEFENDER</b>' +
                        '</td>' +
                        '</tr>' +
                        '</table>';

                    viewer.addOverlay({
                        element: menu,
                        location: new OpenSeadragon.Point(this.x + 0.5 * box_size, this.y + 0.5 * box_size),
                        checkResize: false
                    });

                    this.menu = viewer.getOverlayById('menu');
                }
            }
        });
    }

    update(asset_x, asset_y, highlight_x, highlight_y) {

        this.x = asset_x;
        this.y = asset_y;
        if (!show_inactive && isInactive(this.faction)) {
            this.highlight_box.style.display = 'none';
            this.container.style.display = 'none';
            this.container.childNodes.forEach(c => {
                c.style.display = 'none';
            });
            if (this.menu_on) {
                this.menu_on = false;
                this.menu = undefined;
                viewer.removeOverlay('menu');
            }
        } else {
            this.highlight_box.update(new OpenSeadragon.Rect(highlight_x, highlight_y, box_size, box_size), null);
            this.highlight_box.style.display = 'block';
            this.container.setAttribute('x', asset_x);
            this.container.setAttribute('y', asset_y);
            this.container.style.display = 'block';
            this.container.childNodes.forEach(c => {
                c.setAttribute('x', asset_x);
                c.setAttribute('y', asset_y);
                c.style.display = 'block';
            });
            if (this.menu_on) {
                this.menu.update(new OpenSeadragon.Point(this.x + 0.5 * box_size, this.y + 0.5 * box_size), null);
            }
        }
    }

    opacity(val) {
        this.color_box.style.opacity = val;
        if (val < 1) {
            this.alpha_box.style.opacity = val;
            if (this.stealth) {
                this.stealth_box.style.opacity = 0;
            }
            if (this.imperial) {
                this.imperial_box.style.opacity = 0;
            }
            if (this.inactive) {
                this.inactive_box.style.opacity = val;
            }
        } else {
            this.alpha_box.style.opacity = this.summoning ? 0.5 : 1;
            if (this.stealth) {
                this.stealth_box.style.opacity = 1;
            }
            if (this.imperial) {
                this.imperial_box.style.opacity = 1;
            }
            if (this.inactive) {
                this.inactive_box.style.opacity = 1;
            }
        }
    }

    hide(bool) {
        this.hidden = bool;
        if (this.hidden) {
            this.highlight_box.style.display = 'none';
            this.color_box.style.display = 'none';
            this.alpha_box.style.display = 'none';
            if (this.stealth) {
                this.stealth_box.style.display = 'none';
            }
            if (this.imperial) {
                this.imperial_box.style.display = 'none';
            }
            if (this.inactive) {
                this.inactive_box.style.display = 'none';
            }
        } else {
            this.highlight_box.style.display = 'block';
            this.color_box.style.display = 'block';
            this.alpha_box.style.display = 'block';
            if (this.stealth) {
                this.stealth_box.style.display = 'block';
            }
            if (this.imperial) {
                this.imperial_box.style.display = 'block';
            }
            if (this.inactive) {
                this.inactive_box.style.display = 'block';
            }
        }
    }

    highlightAsset() {
        for (let asset in asset_objects) {
            if (hasProp(asset_objects, asset)) {
                let a = asset_objects[asset];
                if (this.id !== a.id) {
                    // asset_objects[asset].opacity(0.05);
                    asset_objects[asset].hide(true);
                }
            }
        }
    }

    stopHighlightAsset() {
        filterList();
    }
}

class AssetHighlight {
    constructor(id, faction, x, y) {
        this.id = id;
        this.faction = faction;
        this.x = x;
        this.y = y;

        let highlight = document.createElement('div');
        highlight.id = this.id + '-highlight';
        highlight.className = 'highlight ' + factions[this.faction]['short'].toLowerCase();
        highlight.setAttribute('draggable', 'true');

        viewer.addOverlay({
            element: highlight,
            location: new OpenSeadragon.Rect(this.x, this.y, box_size, box_size)
        });
    }
}

function toBattleSlot(id, role) {
    if (!show_battle_container) {
        toggleBattleContainer();
    }

    viewer.removeOverlay('menu');
    menu_on = false;

    let a = asset_objects[id];
    a['menu_on'] = false;
    a['menu'] = undefined;

    clearBattleSlot(role);

    getElem(`${role}-asset-type-stattier`).innerHTML = a.isboi ? '' : a.type + ', ' + a.stat + ' ' + a.stat_tier;
    getElem(`${role}-asset-name`).innerHTML = `${a.name_str}`;
    getElem(`${role}-asset-hp`).innerHTML = `${a.hp}/${a.max_hp}`;
    getElem(`${role}-asset-atk`).innerHTML = `${a.atk}`;
    getElem(`${role}-asset-def`).innerHTML = `${a.def}`;
    getElem(`${role}-fac-name`).innerHTML = `${factions[a.faction]['short'].toUpperCase()}`;
    getElem(`${role}-fac-name`).style.color = '#fff';

    if (getElem(`${role}-asset`).classList.contains('dropped-a')) {
        getElem(`${role}-asset`).classList.remove('dropped-a');
        getElem(`${role}-asset`).classList.add('dropped-b');
    } else if (getElem(`${role}-asset`).classList.contains('dropped-b')) {
        getElem(`${role}-asset`).classList.remove('dropped-b');
        getElem(`${role}-asset`).classList.add('dropped-a');
    } else {
        getElem(`${role}-asset`).classList.add('dropped-a');
    }

    getElem(`${role}-asset-inactive`).style.display = 'none';
    getElem(`${role}-asset-active`).style.display = 'table';
    getElem(`${role}-asset-del`).style.display = 'block';
    parseBattleStats();
}

function clearBattleSlot(role) {
    fadeoutRollArrows('all');
    disarmRollButton('all');
    getElem('fight-button').classList.remove('active');
    getElem('fight-button').removeAttribute('onclick');
    getElem('fight-button').style.color = '#444';
    if (role === 'attacker') {
        getElem('attacker-stat').innerHTML = '-';
        getElem('attacker-fac-name').innerHTML = 'ATTACKER';
        attacker_advantage = false;
    } else {
        getElem('defender-fac-name').innerHTML = 'DEFENDER';
        defender_advantage = false;
    }
    getElem('attacker-stat').style.color = '#444';
    getElem('defender-stat').innerHTML = '-';
    getElem('defender-stat').style.color = '#444';
    getElem('attacker-hit-chance').innerHTML = 'TO HIT: -';
    getElem('defender-evade-chance').innerHTML = 'TO EVADE: -';
    getElem('attacker-roll-span').innerHTML = '';
    getElem('defender-roll-span').innerHTML = '';
    attacker_roll_result = undefined;
    defender_roll_result = undefined;
    getElem('attacker-reroll').removeAttribute('onclick');
    getElem('defender-reroll').removeAttribute('onclick');
    clearTimeout(short_timeout);
    clearTimeout(long_timeout);

    getElem(`${role}-fac-name`).style.color = '#444';
    getElem(`${role}-asset-active`).style.display = 'none';
    getElem(`${role}-asset-del`).style.display = 'none';
    getElem(`${role}-asset-inactive`).style.display = 'table';
    getElem(`${role}-advantage-checkbox`).checked = false;
}

function expandFaction(short) {
    for (let fac in factions) {
        if (hasProp(factions, fac)) {
            if (short === factions[fac]['short'].toUpperCase()) {
                return fac;
            }
        }
    }
}

function toggleAdvantage(role) {
    if (role === 'attacker') {
        attacker_advantage = !attacker_advantage;
    } else {
        defender_advantage = !defender_advantage;
    }
    parseBattleStats();
}

function parseBattleStats() {
    let atk_faction = getElem('attacker-fac-name').innerHTML;
    if (atk_faction !== 'ATTACKER') {
        let atk_str = getElem('attacker-asset-atk').innerHTML.toUpperCase();
        let stats = atk_str.split(', ')[0];
        let stat_atk = stats.split('V')[0];
        let stat_def = stats.split('V')[1];
        let bonus_atk = faction_tracker[expandFaction(atk_faction)][stat_atk];
        getElem('attacker-stat').innerHTML = bonus_atk;

        let def_faction = getElem('defender-fac-name').innerHTML;
        if (def_faction !== 'DEFENDER') {
            let bonus_def = faction_tracker[expandFaction(def_faction)][stat_def];
            getElem('defender-stat').innerHTML = bonus_def;

            let difference = parseInt(bonus_atk) - parseInt(bonus_def);
            let chance_atk;
            switch (true) {
                case attacker_advantage && defender_advantage:
                    chance_atk = chances[difference]['both'];
                    break;
                case attacker_advantage && !defender_advantage:
                    chance_atk = chances[difference]['atk'];
                    break;
                case !attacker_advantage && defender_advantage:
                    chance_atk = chances[difference]['def'];
                    break;
                case !attacker_advantage && !defender_advantage:
                    chance_atk = chances[difference]['none'];
                    break;
            }
            let chance_def = 100 - chance_atk;
            getElem('attacker-hit-chance').innerHTML = `TO HIT: ${chance_atk}%`;
            getElem('defender-evade-chance').innerHTML = `TO EVADE: ${chance_def}%`;
            armRollButton('all');
        }
    }
}

function armRollButton(role) {
    if (role === 'all') {
        getElem('attacker-stat').style.color = '#fff';
        getElem('defender-stat').style.color = '#fff';
        getElem('fight-button').style.color = '#fff';
        getElem('fight-button').classList.add('active');
        getElem('fight-button').setAttribute('onclick', 'rollDice()');

        getElem('attacker-reroll').classList.add('active');
        getElem('attacker-reroll').setAttribute('onclick', 'singleRoll(\'attacker\', \'hit\')');
        getElem('defender-reroll').classList.add('active');
        getElem('defender-reroll').setAttribute('onclick', 'singleRoll(\'defender\', \'hit\')');

        if (getElem('attacker-asset-atk').innerText !== '-') {
            getElem('attacker-dmg').classList.add('active');
            getElem('attacker-dmg').setAttribute('onclick', 'singleRoll(\'attacker\', \'dmg\')');
        }
        if (getElem('defender-asset-def').innerText !== '-') {
            getElem('defender-dmg').classList.add('active');
            getElem('defender-dmg').setAttribute('onclick', 'singleRoll(\'defender\', \'dmg\')');
        }

        getElem('attacker-advantage-checkbox').removeAttribute('disabled');
        getElem('attacker-advantage-checkmark').style.backgroundColor = '#262626';

        getElem('defender-advantage-checkbox').removeAttribute('disabled');
        getElem('defender-advantage-checkmark').style.backgroundColor = '#262626';
    } else if (role === 'attacker') {
        getElem('attacker-reroll').classList.add('active');
        getElem('attacker-reroll').setAttribute('onclick', 'singleRoll(\'attacker\', \'hit\')');
        if (getElem('attacker-asset-atk').innerText !== '-') {
            getElem('attacker-dmg').classList.add('active');
            getElem('attacker-dmg').setAttribute('onclick', 'singleRoll(\'attacker\', \'dmg\')');
        }
        getElem('attacker-advantage-checkbox').removeAttribute('disabled');
        getElem('attacker-advantage-checkmark').style.backgroundColor = '#262626';
    } else {
        getElem('defender-reroll').classList.add('active');
        getElem('defender-reroll').setAttribute('onclick', 'singleRoll(\'defender\', \'hit\')');
        if (getElem('defender-asset-def').innerText !== '-') {
            getElem('defender-dmg').classList.add('active');
            getElem('defender-dmg').setAttribute('onclick', 'singleRoll(\'defender\', \'dmg\')');
        }
        getElem('defender-advantage-checkbox').removeAttribute('disabled');
        getElem('defender-advantage-checkmark').style.backgroundColor = '#262626';
    }
}

function disarmRollButton(role) {
    getElem('fight-button').removeAttribute('onclick');
    getElem('fight-button').classList.remove('active');
    getElem('fight-button').style.color = '#444';
    getElem('attacker-stat').style.color = '#444';
    getElem('defender-stat').style.color = '#444';
    if (role === 'all') {
        getElem('attacker-reroll').classList.remove('active');
        getElem('attacker-reroll').removeAttribute('onclick');
        getElem('defender-reroll').classList.remove('active');
        getElem('defender-reroll').removeAttribute('onclick');
        getElem('attacker-dmg').classList.remove('active');
        getElem('attacker-dmg').removeAttribute('onclick');
        getElem('defender-dmg').classList.remove('active');
        getElem('defender-dmg').removeAttribute('onclick');
        getElem('attacker-advantage-checkmark').style.backgroundColor = '#222';
        getElem('attacker-advantage-checkbox').setAttribute('disabled', '');
        getElem('defender-advantage-checkmark').style.backgroundColor = '#222';
        getElem('defender-advantage-checkbox').setAttribute('disabled', '');
    }
    if (role === 'attacker') {
        getElem('attacker-reroll').classList.remove('active');
        getElem('attacker-reroll').removeAttribute('onclick');
        getElem('attacker-dmg').classList.remove('active');
        getElem('attacker-dmg').removeAttribute('onclick');
        getElem('attacker-advantage-checkmark').style.backgroundColor = '#222';
        getElem('attacker-advantage-checkbox').setAttribute('disabled', '');
    }
    if (role === 'defender') {
        getElem('defender-reroll').classList.remove('active');
        getElem('defender-reroll').removeAttribute('onclick');
        getElem('defender-dmg').classList.remove('active');
        getElem('defender-dmg').removeAttribute('onclick');
        getElem('defender-advantage-checkmark').style.backgroundColor = '#222';
        getElem('defender-advantage-checkbox').setAttribute('disabled', '');
    }
}

function generateSpinAnimation(name) {
    let overshoot = Math.floor(Math.random() * 51) - 25 + 5080;
    let spinback_point = ((overshoot - 5055) / (5105 - 5055)) * (65 - 85) + 85;

    return [{
        name: name,
        '0%': {
            'top': '0'
        },
        [spinback_point.toString() + '%']: {
            'top': `-${overshoot}px`
        },
        '100%': {
            top: '-5040px'
        }
    }];
}

function rollDice() {
    let atk_stat = parseInt(getElem('attacker-stat').innerText);
    let def_stat = parseInt(getElem('defender-stat').innerText);

    let store_idx = 63;
    roll_str = '';
    if (attacker_roll_result) {
        roll_str += attacker_roll_result.toString() + '<br />';
        store_idx = 62;
    }
    for (let i = 0; i < 65; i++) {
        let roll = (Math.floor(Math.random() * 10) + 1 + atk_stat);
        if (attacker_advantage) {
            let adv_roll = (Math.floor(Math.random() * 10) + 1 + atk_stat);
            roll = Math.max(roll, adv_roll);
        }
        roll_str += roll.toString() + '<br />';
        if (i === store_idx) {
            attacker_roll_result = roll;
        }
    }
    getElem('attacker-roll-span').innerHTML = roll_str;

    store_idx = 63;
    roll_str = '';
    if (defender_roll_result) {
        roll_str += defender_roll_result.toString() + '<br />';
        store_idx = 62;
    }
    for (let i = 0; i < 65; i++) {
        let roll = (Math.floor(Math.random() * 10) + 1 + def_stat);
        if (defender_advantage) {
            let adv_roll = (Math.floor(Math.random() * 10) + 1 + def_stat);
            roll = Math.max(roll, adv_roll);
        }
        roll_str += roll.toString() + '<br />';
        if (i === store_idx) {
            defender_roll_result = roll;
        }
    }
    getElem('defender-roll-span').innerHTML = roll_str;

    let atk_anim = generateSpinAnimation('atk_anim');
    $.keyframe.define(atk_anim);

    let def_anim = generateSpinAnimation('def_anim');
    $.keyframe.define(def_anim);

    let atk_anim_duration = Math.random() * 2 + 4;
    $('#attacker-roll-span').playKeyframe(
        `atk_anim ${atk_anim_duration}s ease-in-out 0s 1 forwards`
    );

    let def_anim_duration = Math.random() * 2 + 6;
    $('#defender-roll-span').playKeyframe(
        `atk_anim ${def_anim_duration}s ease-in-out 0s 1 forwards`
    );

    fadeoutRollArrows('all');
    disarmRollButton('all');
    long_timeout = setTimeout(() => {
        fadeinRollArrow('attacker', 'hit');
        fadeinRollArrow('defender', 'hit');
        armRollButton('all');
    }, Math.floor(def_anim_duration * 1000));
}

function fadeinRollArrow(role, type) {
    if (role === 'attacker') {
        if (type === 'hit') {
            getElem('attacker-atk-arrow').style.opacity = '1';
            getElem('attacker-dmg-arrow').style.opacity = '0';
        } else {
            getElem('attacker-atk-arrow').style.opacity = '0';
            getElem('attacker-dmg-arrow').style.opacity = '1';
        }
    } else {
        if (type === 'hit') {
            getElem('defender-def-arrow').style.opacity = '1';
            getElem('defender-dmg-arrow').style.opacity = '0';
        } else {
            getElem('defender-def-arrow').style.opacity = '0';
            getElem('defender-dmg-arrow').style.opacity = '1';
        }
    }
}

function fadeoutRollArrows(role) {
    if (role === 'all') {
        getElem('attacker-atk-arrow').style.opacity = '0';
        getElem('attacker-dmg-arrow').style.opacity = '0';
        getElem('defender-def-arrow').style.opacity = '0';
        getElem('defender-dmg-arrow').style.opacity = '0';
    } else if (role === 'attacker') {
        getElem('attacker-atk-arrow').style.opacity = '0';
        getElem('attacker-dmg-arrow').style.opacity = '0';
    } else {
        getElem('defender-def-arrow').style.opacity = '0';
        getElem('defender-dmg-arrow').style.opacity = '0';
    }
}

function singleRoll(role, type) {
    let store_idx = 63;
    roll_str = '';
    // disarmRollButton(role);
    fadeoutRollArrows(role);
    disarmRollButton('all');
    let num_dice;
    let num_sides;
    let bonus;

    if (role === 'attacker') {
        if (type === 'hit') {
            num_dice = 1;
            num_sides = 10;
            bonus = parseInt(getElem('attacker-stat').innerText);
        } else {
            let dmg = getElem('attacker-asset-atk').innerHTML.split(', ')[1];
            let dice;
            if (dmg.includes('+')) {
                dice = dmg.split('+')[0];
                bonus = parseInt(dmg.split('+')[1]);
            } else {
                dice = dmg;
                bonus = 0;
            }
            num_dice = parseInt(dice.split('d')[0]);
            num_sides = parseInt(dice.split('d')[1]);
        }

        if (attacker_roll_result) {
            roll_str += attacker_roll_result.toString() + '<br />';
            store_idx = 62;
        }
        for (let i = 0; i < 65; i++) {
            if (type === 'hit') {
                let roll = (Math.floor(Math.random() * num_sides) + 1 + bonus);
                if (attacker_advantage) {
                    let adv_roll = (Math.floor(Math.random() * num_sides) + 1 + bonus);
                    roll = Math.max(roll, adv_roll);
                }
                roll_str += roll.toString() + '<br />';
                if (i === store_idx) {
                    attacker_roll_result = roll;
                }
            } else {
                let roll = 0;
                for (let i = 0; i < num_dice; i++) {
                    roll += (Math.floor(Math.random() * num_sides) + 1 + bonus);
                }
                roll_str += roll.toString() + '<br />';
                if (i === store_idx) {
                    attacker_roll_result = roll;
                }
            }
        }

        getElem('attacker-roll-span').innerHTML = roll_str;

        let atk_anim = generateSpinAnimation('atk_anim');
        $.keyframe.define(atk_anim);
        $('#attacker-roll-span').playKeyframe(
            'atk_anim 5s ease-in-out 0s 1 forwards'
        );

        clearTimeout(long_timeout);
        short_timeout = setTimeout(() => {
            fadeinRollArrow(role, type);
            armRollButton('all');
        }, 5000);
    } else {
        if (type === 'hit') {
            num_dice = 1;
            num_sides = 10;
            bonus = parseInt(getElem('defender-stat').innerText);
        } else {
            let dmg = getElem('defender-asset-def').innerHTML;
            let dice;
            if (dmg.includes('+')) {
                dice = dmg.split('+')[0];
                bonus = parseInt(dmg.split('+')[1]);
            } else {
                dice = dmg;
                bonus = 0;
            }
            num_dice = parseInt(dice.split('d')[0]);
            num_sides = parseInt(dice.split('d')[1]);
        }

        if (defender_roll_result) {
            roll_str += defender_roll_result.toString() + '<br />';
            store_idx = 62;
        }
        for (let i = 0; i < 65; i++) {
            if (type === 'hit') {
                let roll = (Math.floor(Math.random() * num_sides) + 1 + bonus);
                if (defender_advantage) {
                    let adv_roll = (Math.floor(Math.random() * num_sides) + 1 + bonus);
                    roll = Math.max(roll, adv_roll);
                }
                roll_str += roll.toString() + '<br />';
                if (i === store_idx) {
                    defender_roll_result = roll;
                }
            } else {
                let roll = 0;
                for (let i = 0; i < num_dice; i++) {
                    roll += (Math.floor(Math.random() * num_sides) + 1 + bonus);
                }
                roll_str += roll.toString() + '<br />';
                if (i === store_idx) {
                    defender_roll_result = roll;
                }
            }
        }

        getElem('defender-roll-span').innerHTML = roll_str;

        let def_anim = generateSpinAnimation('def_anim');
        $.keyframe.define(def_anim);
        $('#defender-roll-span').playKeyframe(
            'def_anim 7s ease-in-out 0s 1 forwards'
        );

        clearTimeout(short_timeout);
        long_timeout = setTimeout(() => {
            fadeinRollArrow(role, type);
            armRollButton('all');
        }, 7000);
    }

    // console.log([num_dice, num_sides, bonus]);
}

function showNavRoutes() {
    for (let a in asset_objects) {
        if (hasProp(asset_objects, a)) {
            let asset = asset_objects[a];
            let hex_id = asset['hex_id'];
            let range = asset['range'];
            if (range > 0) {
                let hex_list = hexes[hex_id][range];
                hex_list.forEach(h => {
                    if (hasProp(hexes[h], 'Name')) {
                        let system = hexes[h]['Name'];
                        let planets = system_tracker[system]['Planets'];
                        for (let planet_id in planet_objects) {
                            if (hasProp(planet_objects, planet_id)) {
                                let remote_name = planet_objects[planet_id]['planet_name'];
                                if (planets.indexOf(remote_name) > -1 && remote_name !== asset.location.split(' // ')[2]) {
                                    let [target_x, target_y] = planet_objects[planet_id].pos();
                                    let source_x = asset.x + asset.size / 2;
                                    let source_y = asset.y + asset.size / 2;
                                    let angle = Math.atan2(target_y - source_y, target_x - source_x) * 180 / Math.PI;
                                    let link;
                                    if ((angle <= 45 && angle >= -45) || (angle >= 135 && angle <= -135)) {
                                        link = d3.linkHorizontal();
                                    } else {
                                        link = d3.linkVertical();
                                    }

                                    let path = {
                                        source: [asset.x + asset.size / 2, asset.y + asset.size / 2],
                                        target: [target_x, target_y]
                                    };
                                    d3.select(svg_overlay.node())
                                        .insert('path', '.planet')
                                        .attr('class', 'nav-route')
                                        .attr('d', link(path))
                                        .attr('fill', 'rgba(255,255,255,0)')
                                        .attr('stroke', '#7c7c7c')
                                        .style('stroke-width', 0.00065)
                                        .style('opacity', 0);

                                    let nav_routes = document.getElementsByClassName('nav-route');
                                    [...nav_routes].forEach(nav => {
                                        nav.style.opacity = 1;
                                    });
                                }
                            }
                        }
                    }
                });
            }
        }
    }
}

function cube_to_oddq(cube) {
    let col = cube.x;
    let row = cube.z + (cube.x - (cube.x & 1)) / 2;
    return {'col': col, 'row': row};
}

function oddq_to_cube(hex) {
    let h = hex.replace('hex-', '');
    let col = parseInt(h.slice(0, 2));
    let row = parseInt(h.slice(2));
    let x = col;
    let z = row - (col - (col & 1)) / 2;
    let y = -x - z;
    return {'x': x, 'y': y, 'z': z};
}

function cube_distance(a, b) {
    return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z)) / 2;
}

function toggleInfluenceOverlay() {

    if (!show_regions) {

        hexes['hex-0808']['Factions'] = {'The Guild': 42};

        for (let sys in system_tracker) {
            if (hasProp(system_tracker, sys)) {
                if (Object.keys(system_tracker[sys]['Factions']).length > 0) {
                    let local_infl = {};
                    for (let fac in system_tracker[sys]['Factions']) {
                        if (hasProp(system_tracker[sys]['Factions'], fac)) {
                            if (!isInactive(fac) || show_inactive) {
                                local_infl[fac] = system_tracker[sys]['Factions'][fac]['INFL'];
                            }
                        }
                    }
                    let this_hex = 'hex-' + system_tracker[sys]['Hex'];
                    let owner = Object.keys(local_infl).reduce((a, b) => local_infl[a] > local_infl[b] ? a : b);
                    let infl = system_tracker[sys]['Factions'][owner]['INFL'];
                    hexes[this_hex]['Factions'] = {[owner]: infl};

                    for (let remote_hex in hexes) {
                        if (hasProp(hexes, remote_hex)) {
                            if (!hasProp(hexes[remote_hex], 'Name')) {
                                let here = oddq_to_cube(this_hex);
                                let there = oddq_to_cube(remote_hex);
                                let distance = cube_distance(here, there);
                                let k = Math.pow(0.5, distance);
                                let remote_infl = k * infl;
                                if (!hasProp(hexes[remote_hex], 'Factions')) {
                                    hexes[remote_hex]['Factions'] = {};
                                }
                                if (!isInactive(owner) || show_inactive) {
                                    if (!hasProp(hexes[remote_hex]['Factions'], owner)) {
                                        hexes[remote_hex]['Factions'][owner] = remote_infl;
                                    } else {
                                        hexes[remote_hex]['Factions'][owner] += remote_infl;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        for (let planet in planet_objects) {
            if (hasProp(planet_objects, planet)) {
                let p = planet_objects[planet];
                let hex_infl = hexes[p['hex_id']]['Factions'];
                let owner = Object.keys(hex_infl).reduce((a, b) => hex_infl[a] > hex_infl[b] ? a : b);
                planet_objects[planet].color(factions[owner]['text'], factions[owner]['color']);
                planet_objects[planet].circleColor(factions[owner]['text']);
            }
        }

        for (let hex in hexes) {
            if (hasProp(hexes, hex)) {
                let hex_infl = hexes[hex]['Factions'];
                let owner = Object.keys(hex_infl).reduce((a, b) => hex_infl[a] > hex_infl[b] ? a : b);
                // let total_infl = Object.values(hex_infl).reduce((a, b) => a + b, 0);
                // let r = 0;
                // let g = 0;
                // let b = 0;

                // for (let fac in hex_infl) {
                //     if (hasProp(hex_infl, fac)) {
                //         let rgb = hexToRGB(factions[fac]['color']);
                //         r += rgb[0] * (hex_infl[fac] / total_infl);
                //         g += rgb[1] * (hex_infl[fac] / total_infl);
                //         b += rgb[2] * (hex_infl[fac] / total_infl);
                //     }
                // }
                let h = getElem(hex);
                h.style.opacity = 1;
                // h.style.fill = `rgb(${r*255}, ${g*255}, ${b*255})`;
                h.style.fill = factions[owner]['color'];
                system_objects[hex].hexColor(factions[owner]['text']);
                if (hasProp(hexes[hex], 'Name')) {
                    system_objects[hex].color(factions[owner]['text']);
                }
            }
        }
        show_regions = true;
        getElem('region').style.color = '#777777';
    } else {
        filterList();

        for (let sys in system_objects) {
            if (hasProp(system_objects, sys)) {
                system_objects[sys].hexColor('#7c7c7c');
                if (system_objects[sys]['system_name'] !== '') {
                    system_objects[sys].color('#7c7c7c');
                }
            }
        }

        for (let hex in hexes) {
            if (hasProp(hexes, hex)) {
                let h = getElem(hex);
                h.style.opacity = 0;
            }
        }
        show_regions = false;
        getElem('region').style.color = '#444444';
    }
}

function hexToRGB(h, isPct) {
    let r = 0, g = 0, b = 0;
    isPct = isPct === true;

    if (h.length == 4) {
        r = '0x' + h[1] + h[1];
        g = '0x' + h[2] + h[2];
        b = '0x' + h[3] + h[3];

    } else if (h.length == 7) {
        r = '0x' + h[1] + h[2];
        g = '0x' + h[3] + h[4];
        b = '0x' + h[5] + h[6];
    }

    r = +(r / 255).toFixed(1);
    g = +(g / 255).toFixed(1);
    b = +(b / 255).toFixed(1);

    return [r, g, b];
}

function createAssetPoolEntry(data) {

    let asset_class_str;
    let asset_stealth_str;
    if (!data.stealth) {
        asset_class_str = 'asset-table';
        asset_stealth_str = '-';
    } else {
        asset_class_str = 'asset-table stealth';
        asset_stealth_str = 'stealthed';
    }

    let color = factions[data.faction]['color'];
    let type_stat_str = data.isboi ? '' : data.type + ', ' + data.stat + ' ' + data.stat_tier;

    let asset_div = `<div class="asset-item" id="${data.id}-pool" data-faction="${data.faction.replace('\'', '&#39;')}" data-stealth="${asset_stealth_str}" onclick="toggleHighlightAsset(this.id)" onmouseover="highlightAssetTable(this.id)" onmouseleave="stopHighlightAssetTable(this.id)">` +
        `<table id="${data.id}-pool-table" class="${asset_class_str}">` +
        '<tr>' +
        `<td class="fac-color-td" rowspan="4" style="background-color: ${color}">` +
        '</td>' +
        '<td class=\'top-row-td\' colspan=\'5\'>' +
        '<div class=\'location-div\'>' +
        data.location +
        '</div>' +
        '<div class=\'type-stat-div\'>' +
        type_stat_str +
        '</div>' +
        '</td>' +
        '</tr>' +
        '<tr>' +
        '<td class=\'name-td\' colspan=\'5\'>' +
        data.name +
        '</td>' +
        '</tr>' +
        '<tr>' +
        '<td class=\'hp-td\'>' +
        data.hp + '/' + data.max_hp +
        '</td>' +
        '<td class=\'cost-td\'>' +
        data.cost +
        '</td>' +
        '<td class=\'tl-td\'>' +
        data.tl +
        '</td>' +
        '<td class=\'atk-td\'>' +
        data.atk +
        '</td>' +
        '<td class=\'def-td\'>' +
        data.def +
        '</td>' +
        '</tr>' +
        '<tr>' +
        '<td class=\'hp-td\' style=\'padding-bottom: 4px\'>' +
        '<img class=\'icon-pool\' src=\'img/hp_icon.png\' alt=\'\' />' +
        '</td>' +
        '<td class=\'cost-td\' style=\'padding-bottom: 4px\'>' +
        '<img class=\'icon-pool\' src=\'img/cost_icon.png\' alt=\'\' />' +
        '</td>' +
        '<td class=\'tl-td\' style=\'padding-bottom: 4px\'>' +
        '<img class=\'icon-pool\' src=\'img/tl_icon.png\' alt=\'\' />' +
        '</td>' +
        '<td class=\'atk-td\' style=\'padding-bottom: 4px\'>' +
        '<img class=\'icon-pool\' src=\'img/atk_icon.png\' alt=\'\' />' +
        '</td>' +
        '<td class=\'def-td\' style=\'padding-bottom: 4px\'>' +
        '<img class=\'icon-pool\' src=\'img/def_icon.png\' alt=\'\' />' +
        '</td>' +
        '</tr>' +
        '</table>' +
        '</div>';

    let asset_pool = getElem('asset-pool');
    asset_pool.insertAdjacentHTML('beforeend', asset_div);

    if (isInactive(data.faction)) {
        getElem(`${data.id}-pool`).style.display = 'none';
    }
}

function getElem(id) {
    return document.getElementById(id);
}

function hasProp(obj, key) {
    return obj.hasOwnProperty(key);
}

function isInactive(faction) {
    if (faction === 'The Guild' || faction === 'Unclaimed') {
        return true;
    } else {
        return faction_tracker[faction]['Status'] === 'Inactive';
    }
}

function autoSearch(id) {
    let current_search_term = getElem('search-bar').value;
    if (!show_sidebar) {
        toggleSidebar();
    }
    let fac_short = id.replace('-cell', '');
    let faction;
    for (let fac in factions) {
        if (hasProp(factions, fac)) {
            if (factions[fac]['short'] === fac_short) {
                faction = fac;
                break;
            }
        }
    }
    let search_term = factions[faction]['search'];
    if (current_search_term === search_term) {
        delFilter();
        toggleSidebar();
    } else {
        getElem('search-bar').value = search_term;
        filterList();
    }
}

function filterList() {
    let input = getElem('search-bar');
    let filter = input.value.toUpperCase().split(' ');
    let assets = getElem('asset-pool').getElementsByClassName('asset-item');

    recolorPlanetNames();
    Object.values(planet_objects).forEach(planet => {
        let full_name = planet.pgov;
        if (full_name !== '') {
            let short_name = factions[full_name]['short'];
            let search_name = factions[full_name]['search'];

            let search_hits = new Array(filter.length);
            for (let k = 0; k < search_hits.length; k++) {
                search_hits[k] = false;
            }

            for (let j = 0; j < filter.length; j++) {
                let search_term = filter[j].replace(/[^A-Za-z_]/g, '');
                if (full_name.toUpperCase().indexOf(search_term) > -1 ||
                    short_name.toUpperCase().indexOf(search_term) > -1 ||
                    search_name.toLocaleString().indexOf(search_term) > -1) {
                    search_hits[j] = true;
                }
            }

            if (!((!isInactive(full_name) || show_inactive) && !search_hits.includes(false))) {
                planet.color('#7c7c7c', '#222222');
            }
        }
    });

    if (highlighted_asset !== '') {
        let asset_div = getElem(highlighted_asset + '-pool');
        let asset_table = getElem(highlighted_asset + '-pool-table');
        asset_div.style.backgroundColor = '#1e1e1e';
        if (asset_table.classList.contains('stealth')) {
            asset_table.style.backgroundColor = '#293e42';
        } else {
            asset_table.style.backgroundColor = '#222';
        }
        highlighted_asset = '';
    }

    for (let i = 0; i < assets.length; i++) {

        let id = assets[i].getAttribute('id').replace('-pool', '');

        let name = assets[i].getElementsByClassName('name-td')[0];
        let nameValue = name.textContent || name.innerText;

        let facValue = assets[i].getAttribute('data-faction');

        let stealthValue = assets[i].getAttribute('data-stealth');

        let atk = assets[i].getElementsByClassName('atk-td')[0];
        let atkValue = atk.textContent || atk.innerText;

        let loc = assets[i].getElementsByClassName('location-div')[0];
        let locValue = loc.textContent || loc.innerText;

        let typestat = assets[i].getElementsByClassName('type-stat-div')[0];
        let typestatValue = typestat.textContent || typestat.innerText;

        let search_hits = new Array(filter.length);
        for (let k = 0; k < search_hits.length; k++) {
            search_hits[k] = false;
        }

        for (let j = 0; j < filter.length; j++) {
            let search_term = filter[j].replace(/[^A-Za-z_]/g, '');
            if (nameValue.toUpperCase().indexOf(search_term) > -1 ||
                facValue.toUpperCase().indexOf(search_term) > -1 ||
                stealthValue.toUpperCase().indexOf(search_term) > -1 ||
                typestatValue.toUpperCase().indexOf(search_term) > -1 ||
                atkValue.toUpperCase().indexOf(search_term) > -1 ||
                locValue.toUpperCase().indexOf(search_term) > -1) {
                search_hits[j] = true;
            }
        }

        if ((!isInactive(facValue) || show_inactive) && !search_hits.includes(false)) {
            assets[i].style.display = 'block';
            asset_objects[id].hide(false);
        } else {
            assets[i].style.display = 'none';
            asset_objects[id].hide(true);
        }
    }

    if (input.value !== '') {
        document.getElementById('del-button').style.display = 'block';
    } else {
        document.getElementById('del-button').style.display = 'none';
    }
}

function delFilter() {
    let input = document.getElementById('search-bar');
    input.value = '';
    filterList();
    recolorPlanetNames();
}

function toggleFactionTable() {
    show_faction_table = !show_faction_table;
    let col = getElem('factions-col');
    let toggle = getElem('faction-toggle');
    if (show_faction - table) {
        col.style.right = '10px';
        toggle.style.transform = 'rotate(0deg)';
    } else {
        col.style.right = '-210px';
        toggle.style.transform = 'rotate(-90deg)';
    }
}

function toggleBattleContainer() {
    show_battle_container = !show_battle_container;
    let battle_container = getElem('battle-container');
    let toggle = getElem('battle-container-toggle');
    if (show_battle_container) {
        battle_container.style.bottom = '0';
        toggle.style.bottom = '180px';
        toggle.style.transform = 'rotate(0deg)';
    } else {
        battle_container.style.bottom = '-180px';
        toggle.style.bottom = '10px';
        toggle.style.transform = 'rotate(180deg)';
    }
}

function toggleSidebar() {
    show_sidebar = !show_sidebar;
    let sidebar = getElem('sidebar');
    let toggle = getElem('sidebar-toggle');
    if (show_sidebar) {
        sidebar.style.left = '0';
        toggle.style.left = '405px';
        toggle.style.transform = 'rotate(90deg)';
    } else {
        sidebar.style.left = '-410px';
        toggle.style.left = '5px';
        toggle.style.transform = 'rotate(-90deg)';
    }
}

function replaceInactiveFactionNames(planet, fac, hw) {

    if (planet === 'The Guild Dyson Sphere') {
        getElem('planet-tip-fac').innerHTML = '🔥🔥🔥';
    } else if ((isInactive(fac) && !show_inactive) || fac === 'Unclaimed') {
        getElem('planet-tip-fac').innerHTML = 'Unclaimed';
    } else {
        getElem('planet-tip-fac').innerHTML = fac + hw;
    }
}

function recolorPlanetNames() {

    Object.values(planet_objects).forEach(planet => {
        if (planet['hex_id'] !== 'hex-0808') {
            planet.circleColor('#7c7c7c');
        } else {
            planet.circleColor(factions['The Guild']['color']);
        }
        if (planet.pgov === '' || (isInactive(planet.pgov) && !show_inactive)) {
            planet.color('#7c7c7c', '#222222');
            planet.fontweight('normal');
        } else {
            planet.color(factions[planet.pgov]['text'], factions[planet.pgov]['color']);
            if (planet.pgov === planet.hw) {
                planet.fontweight('bold');
            }
        }
    });
}

function reorderAssets() {

    planet_tracker.forEach(planet => {
        let local_assets = planet['Local Assets'];
        let hex_id = 'hex-' + planet['Hex'];
        let current_idx = planet['idx'];
        let num_planets = planet['total'];

        if (local_assets) {
            let local_counter = 0;
            local_assets.forEach(id => {
                let asset_obj = asset_objects[id];
                let pos = getPosition(hex_id, current_idx, num_planets, local_counter);
                asset_obj.update(pos['asset']['X'], pos['asset']['Y'], pos['highlight']['X'], pos['highlight']['Y']);
                if (show_inactive || !isInactive(asset_obj.faction)) {
                    local_counter++;
                }
            });
        }
    });
    viewer.forceRedraw();
}

function toggleInactiveFactions() {
    show_inactive = !show_inactive;

    if (show_inactive) {
        getElem('visibility').style.color = '#777777';
    } else {
        getElem('visibility').style.color = '#444444';
    }

    reorderAssets();
    sortFactionTable();
    recolorPlanetNames();

    if (show_regions) {
        show_regions = false;
        toggleInfluenceOverlay();
    }

    if (highlighted_asset !== '') {
        let asset = asset_objects[highlighted_asset];
        if (!show_inactive && isInactive(asset.faction)) {
            toggleHighlightAsset(highlighted_asset + '-pool');
        }
    } else {
        filterList();
    }
}

function hidePlanets() {
    Object.values(planet_objects).forEach(planet => {
        planet.color('#7c7c7c', '#222222');
    });
}

function toggleHighlightAsset(id) {
    let asset_id = id.replace('-pool', '');
    let asset_div = getElem(id);
    let asset_table = getElem(id + '-table');
    if (highlighted_asset === asset_id) {
        asset_objects[asset_id].stopHighlightAsset();
        if (asset_table.classList.contains('stealth')) {
            asset_table.style.backgroundColor = '#293e42';
        } else {
            asset_table.style.backgroundColor = '#222';
        }
        asset_div.style.backgroundColor = '#1e1e1e';
        recolorPlanetNames();
        highlighted_asset = '';
    } else {
        if (highlighted_asset !== '') {
            let old_asset_div = getElem(highlighted_asset + '-pool');
            let old_asset_table = getElem(highlighted_asset + '-pool-table');
            old_asset_div.style.backgroundColor = '#1e1e1e';
            if (old_asset_table.classList.contains('stealth')) {
                old_asset_table.style.backgroundColor = '#293e42';
            } else {
                old_asset_table.style.backgroundColor = '#222';
            }
            asset_objects[highlighted_asset].stopHighlightAsset();
        }
        asset_objects[asset_id].highlightAsset();
        if (asset_table.classList.contains('stealth')) {
            asset_table.style.backgroundColor = '#3c6974';
            asset_div.style.backgroundColor = '#3c6974';
        } else {
            asset_table.style.backgroundColor = '#262626';
            asset_div.style.backgroundColor = '#262626';
        }
        hidePlanets();
        highlighted_asset = asset_id;
    }
}

function highlightAssetTable(id) {
    let asset_id = id.replace('-pool', '');
    let asset_table = getElem(asset_id + '-pool-table');
    if (asset_id !== highlighted_asset) {
        if (asset_table.classList.contains('stealth')) {
            asset_table.style.backgroundColor = '#2e5058';
        } else {
            asset_table.style.backgroundColor = '#262626';
        }
    }
}

function stopHighlightAssetTable(id) {
    let asset_id = id.replace('-pool', '');
    let asset_table = getElem(asset_id + '-pool-table');
    if (asset_id !== highlighted_asset) {
        if (asset_table.classList.contains('stealth')) {
            asset_table.style.backgroundColor = '#293e42';
        } else {
            asset_table.style.backgroundColor = '#222';
        }
    }
}

function sortBy(col) {
    let asset_pool = document.getElementById('asset-pool');
    let temp_assets = Object.values(asset_objects);
    for (let direction in dir) {
        if (direction === col) {
            dir[col] *= -1;
        } else {
            dir[direction] = -1;
        }
    }

    let compare = (a, b) => {
        if (col === 'influence') {
            let inflA = parseFloat(faction_tracker[a['faction']]['INFL']);
            let inflB = parseFloat(faction_tracker[b['faction']]['INFL']);
            return inflA < inflB ? dir[col] :
                inflA === inflB ? (a['name'] > b['name'] ? 1 : -1) : -dir[col];
        } else {
            let valA = a[col].toUpperCase();
            let valB = b[col].toUpperCase();
            return valA > valB ? dir[col] : -dir[col];
        }
    };

    if (dir[col] === -1) {
        temp_assets.sort(compare);
    } else {
        temp_assets.reverse().sort(compare);
    }

    temp_assets.forEach((item) => {
        asset_pool.appendChild(getElem(item['id'] + '-pool'));
    });
}

function sortFactionTable() {
    let table, rows, switching, i, fac_a, fac_b, val_a, val_b, shouldSwitch;
    table = getElem('faction-table');
    switching = true;

    while (switching) {
        switching = false;
        rows = table.rows;

        for (i = 0; i < rows.length - 1; i++) {
            shouldSwitch = false;
            fac_a = rows[i].getElementsByTagName('TD')[0].innerText.toLowerCase();
            fac_b = rows[i + 1].getElementsByTagName('TD')[0].innerText.toLowerCase();

            for (let key in factions) {
                if (hasProp(factions, key)) {
                    if (factions[key]['short'].toLowerCase() === fac_a) {
                        val_a = parseFloat(faction_tracker[key]['INFL']);
                    }
                    if (factions[key]['short'].toLowerCase() === fac_b) {
                        val_b = parseFloat(faction_tracker[key]['INFL']);
                    }
                }
            }

            if (val_a < val_b) {
                shouldSwitch = true;
                break;
            }
        }

        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }

    for (let fac in factions) {
        if (hasProp(factions, fac) && isInactive(fac) && fac !== 'The Guild') {
            let row = getElem(factions[fac]['short'] + '-row');

            if (show_inactive) {
                row.style.display = 'table-row';
            } else {
                row.style.display = 'none';
            }
        }
    }

    let table_w = table.offsetWidth;
    let table_h = table.offsetHeight;
    let scale_w = Math.min(viewport_w / table_w, 4) / 4;
    let scale_h = Math.min((viewport_h - 120) / table_h, 1);
    let scale = Math.min(scale_w, scale_h);
    table.style.transform = 'scale(' + scale + ')';

    $('.se-pre-con').fadeOut('slow');
}

function displaySectorInfluence() {
    updateSectorChart();
    getElem('sectorinfluence').style.opacity = '1';
    getElem('sectorinfluence').style.zIndex = '1';
}

function hideSectorInfluence() {
    getElem('sectorinfluence').style.opacity = '0';
    getElem('sectorinfluence').style.zIndex = '-2';
}

function displayFactionInfo(faction) {
    let infl_sum = 0;

    for (let fac in faction_tracker) {
        if (hasProp(faction_tracker, fac) && (!isInactive(fac) || show_inactive)) {
            infl_sum += parseFloat(faction_tracker[fac]['INFL']);
        }
    }

    let goal = faction_tracker[faction]['Goal'];
    let goal_desc;
    if (goal === '') {
        goal = '(No goal)';
        goal_desc = '-';
    } else {
        goal_desc = goals[goal];
    }

    getElem('info-faction').innerHTML = faction_tracker[faction]['Faction'];
    getElem('info-homeworld').innerHTML = faction_tracker[faction]['Homeworld'];
    getElem('info-force').innerHTML = '<b>' + faction_tracker[faction]['F'] + '</b>';
    getElem('info-cunning').innerHTML = '<b>' + faction_tracker[faction]['C'] + '</b>';
    getElem('info-wealth').innerHTML = '<b>' + faction_tracker[faction]['W'] + '</b>';
    getElem('info-hp').innerHTML =
        '<b>' + faction_tracker[faction]['HP'] + '/' + faction_tracker[faction]['Max HP'] + '</b>';
    getElem('info-income').innerHTML = '<b>' + faction_tracker[faction]['Income'] + '</b>';
    getElem('info-balance').innerHTML = '<b>' + faction_tracker[faction]['Balance'] + '</b>';
    getElem('info-exp').innerHTML = '<b>' + faction_tracker[faction]['EXP'] + '</b>';
    getElem('info-goal').innerHTML = goal;
    getElem('info-goal-desc').innerHTML = goal_desc;
    getElem('info-tag').innerHTML = faction_tracker[faction]['Tag'];
    getElem('info-tag-desc').innerHTML = tags[faction_tracker[faction]['Tag']]['desc'];
    getElem('info-notes').innerHTML = faction_tracker[faction]['Notes'];
    getElem('info-infl-abs').innerHTML = (faction_tracker[faction]['INFL']).toFixed(1);
    getElem('info-infl-rel').innerHTML =
        Math.round(1000 * (faction_tracker[faction]['INFL'] / infl_sum)) / 10 + '%';

    getElem('info').style.opacity = '1';
    getElem('info').style.zIndex = '1';
}

function hideFactionInfo() {
    getElem('info').style.opacity = '0';
    getElem('info').style.zIndex = '-2';
}

function tsvJSON(tsv) {
    let lines = tsv.split('\n');
    let headers = lines.splice(0, 1)[0].split('\t');
    let result = lines.map(line => {
        let obj = {};
        let currentline = line.split('\t');

        headers.forEach((h, i) => {
            obj[h.replace('\r', '')] = currentline[i].replace('\r', '');
        });
        return obj;
    });
    return result;
}

function first(i) {
    return (2 * i - 1) * (2 * i - 1);
}

function isqrt(i) {
    if (Math.floor(i) === 0) {
        return 0;
    } else {
        return Math.floor(Math.sqrt(i));
    }
}

function cycle(i) {
    return Math.floor((isqrt(i) + 1) / 2);
}

function len(i) {
    return 8 * i;
}

function sector(i) {
    let c = cycle(i);
    let offset = i - first(c);
    let n = len(c);
    return Math.floor((4 * offset) / n);
}

function getSpiralOffset(i) {
    let x = -0.5;
    let y = -0.5;

    if (i !== 0) {
        let c = cycle(i);
        let s = sector(i);
        let offset = i - first(c) - Math.floor((s * len(c)) / 4);
        if (s === 1) {
            x = -c + offset + 1;
            y = -c;
        } else if (s === 2) {
            x = c;
            y = -c + offset + 1;
        } else if (s === 3) {
            x = c - offset - 1;
            y = c;
        } else {
            x = -c;
            y = c - offset - 1;
        }
        x = -x - 0.5;
        y = -y - 0.5;
    }
    return [x, y];
}

function getPosition(hex_id, idx, total, counter) {
    let pos = {asset: {}, highlight: {}};
    let hex_x = hexes[hex_id]['X'];
    let hex_y = hexes[hex_id]['Y'];
    let x_offset = planet_to_hex_offsets[total][idx]['X'];
    let y_offset = planet_to_hex_offsets[total][idx]['Y'];
    let xy_spiral = getSpiralOffset(counter);
    pos['highlight']['X'] = hex_x + x_offset + xy_spiral[0] * box_size - 0.5 * box_size;
    pos['highlight']['Y'] = hex_y + y_offset + xy_spiral[1] * box_size - 0.5 * box_size;
    pos['asset']['X'] = pos['highlight']['X'] + (box_size - (1 / 1.1) * box_size) / 2;
    pos['asset']['Y'] = pos['highlight']['Y'] + (box_size - (1 / 1.1) * box_size) / 2;
    return pos;
}

function processChart(iterable) {
    let labels = [];
    let values = [];
    let colors = [];
    let txt_colors = [];
    for (let fac in iterable) {
        if (hasProp(iterable, fac) && (!isInactive(fac) || show_inactive)) {
            let fac_infl = iterable[fac]['INFL'];
            if (fac_infl > 0) {
                labels.push(fac);
                values.push(Math.round(fac_infl * 10) / 10);
                colors.push(factions[fac]['color']);
                txt_colors.push(factions[fac]['text']);
            }
        }
    }

    let list = [];

    for (let i = 0; i < labels.length; i++) {
        list.push({
            label: labels[i],
            value: values[i],
            color: colors[i],
            txt_color: txt_colors[i]
        });
    }

    list.sort(function(a, b) {
        return a.value < b.value ? 1 : a.value === b.value ? 0 : -1;
    });

    let sum = 0;

    for (let k = 0; k < list.length; k++) {
        sum += list[k].value;
        labels[k] = list[k].label + ' (' + list[k].value + ')';
        values[k] = list[k].value;
        colors[k] = list[k].color;
        txt_colors[k] = list[k].txt_color;
    }

    let options;

    if (values.length > 0) {
        options = {
            labels: labels,
            colors: colors,
            dataLabels: {
                style: {
                    colors: txt_colors
                }
            }
        };
    } else {
        values = [0.01];
        options = {
            labels: ['No influence'],
            colors: ['#ffffff']
        };
    }
    return [values, options];
}

function updateSectorChart() {
    // Update outer
    let [values, options] = processChart(faction_tracker);
    sectorinfluence_chart_outer.updateSeries(values);
    sectorinfluence_chart_outer.updateOptions(options);
    let total_infl = values.reduce((a, b) => a + b, 0);
    updateSectorChartOptions({
        title: {
            text: 'placeholder-title'
        },
        dataLabels: {
            formatter: (val) => {
                if (val > 5) {
                    return Math.round(val * 10) / 10 + '%';
                } else {
                    return '';
                }
            }
        }
    }, total_infl);

    // Update inner
    let planetwise = [];
    for (let planet_name in influence_tracker) {
        if (hasProp(influence_tracker, planet_name)) {
            let planetary_influence = influence_tracker[planet_name]['Factions'];
            let [values, options] = processChart(planetary_influence);
            let total_influence = values.reduce((a, b) => a + b, 0);
            planetwise.push({'planet_name': planet_name, 'INFL': total_influence});
        }
    }

    planetwise.sort((a, b) => {
        return ((a.INFL < b.INFL) ? 1 : ((a.INFL === b.INFL) ? 0 : -1));
    });

    sectorinfluence_chart_inner.updateSeries(planetwise.map(p => {
        return p.INFL;
    }));
    sectorinfluence_chart_inner.updateOptions({
        labels: planetwise.map(p => {
            return p.planet_name;
        }),
        dataLabels: {
            formatter: (val, opt) => {
                return `${opt.w.globals.seriesNames[opt.seriesIndex]}`;
            }
        }
    });
}

function updateSectorChartOptions(opts, infl = null) {
    sectorinfluence_chart_outer.updateOptions(opts);
    if (infl) {
        let display_infl = Math.round(infl * 10) / 10;
        document.querySelector('#sectorinfluence-chart-outer > div > svg > text')
            .innerHTML = `<tspan x="300" y="288" dy="-0.5em" text-anchor="middle" style="font-size: 32px">${display_infl}</tspan><tspan x="300" dy="1.8em" text-anchor="middle" style="font-size: 20px">Total Influence</tspan>`;
    }
}

function updateSystemChart(system_name) {
    // Update outer
    let system_influence = system_tracker[system_name]['Factions'];
    let [values, options] = processChart(system_influence);
    system_tip_chart_outer.updateSeries(values);
    system_tip_chart_outer.updateOptions(options);
    let total_infl = values.reduce((a, b) => a + b, 0);
    updateSystemChartOptions({
        title: {
            text: ':)'
        },
        dataLabels: {
            formatter: (val) => {
                if (val > 5) {
                    return Math.round(val * 10) / 10 + '%';
                } else {
                    return '';
                }
            }
        }
    }, total_infl);

    // Update inner
    let planetwise = [];

    system_tracker[system_name]['Planets'].forEach(planet_name => {
        let planetary_influence = influence_tracker[planet_name]['Factions'];
        let [values, options] = processChart(planetary_influence);
        let total_influence = values.reduce((a, b) => a + b, 0);
        planetwise.push({'planet_name': planet_name, 'INFL': total_influence});
    });

    planetwise.sort((a, b) => {
        return ((a.INFL < b.INFL) ? 1 : ((a.INFL === b.INFL) ? 0 : -1));
    });

    system_tip_chart_inner.updateSeries(planetwise.map(p => {
        return p.INFL;
    }));
    system_tip_chart_inner.updateOptions({
        labels: planetwise.map(p => {
            return p.planet_name;
        }),
        dataLabels: {
            formatter: (val, opt) => {
                if (val > 5) {
                    return `${opt.w.globals.seriesNames[opt.seriesIndex]}`;
                } else {
                    return '';
                }
            }
        }
    });
}

function updateSystemChartOptions(opts, infl = null) {
    system_tip_chart_outer.updateOptions(opts);
    if (infl) {
        let display_infl = Math.round(infl * 10) / 10;
        document.querySelector('#system-tip-chart-outer > div > svg > text')
            .innerHTML = `<tspan x="210" dy="-0.5em" text-anchor="middle" style="font-size: 24px">${display_infl}</tspan><tspan x="210" dy="1.8em" text-anchor="middle">Total Influence</tspan>`;
    }
}

function resizeSystemTip() {
    let h1 = getElem('orbital-objects-chart-container').offsetHeight;
    let h2 = getElem('system-tip-chart-outer').offsetHeight;
    getElem('system-tip-chart-container').style.height = `${h2}px`;
    getElem('system-tip').style.height = `${h1 + h2 + 70}px`;
}

function updatePlanetChart(planet_name) {
    let planetary_influence = influence_tracker[planet_name]['Factions'];
    let [values, options] = processChart(planetary_influence);
    planet_tip_chart.updateSeries(values);
    planet_tip_chart.updateOptions(options);
    let total_infl = values.reduce((a, b) => a + b, 0);
    updatePlanetChartOptions({
        title: {
            text: 'placeholder-title'
        },
        dataLabels: {
            formatter: (val) => {
                if (val > 5) {
                    return Math.round(val * 10) / 10 + '%';
                } else {
                    return '';
                }
            }
        }
    }, total_infl);
}

function updatePlanetChartOptions(opts, infl = null) {
    planet_tip_chart.updateOptions(opts);
    if (infl) {
        let display_infl = Math.round(infl * 10) / 10;
        document.querySelector('#planet-tip-chart > div > svg > text')
            .innerHTML = `<tspan x="210" dy="-0.5em" text-anchor="middle" style="font-size: 24px">${display_infl}</tspan><tspan x="210" dy="1.8em" text-anchor="middle">Total Influence</tspan>`;
    }
}

function pointCoords(hex_x, hex_y, hex_w, hex_h) {
    A = {'x': hex_x - hex_w / 2, 'y': hex_y};
    B = {'x': hex_x - hex_w / 4, 'y': hex_y - hex_h / 2};
    C = {'x': hex_x + hex_w / 4, 'y': hex_y - hex_h / 2};
    D = {'x': hex_x + hex_w / 2, 'y': hex_y};
    E = {'x': hex_x + hex_w / 4, 'y': hex_y + hex_h / 2};
    F = {'x': hex_x - hex_w / 4, 'y': hex_y + hex_h / 2};
    return `${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y} ${D.x},${D.y} ${E.x},${E.y} ${F.x},${F.y}`;
}

function makeHexOverlays(key) {
    const size = 0.0635;
    const hex_w = 2 * size;
    const hex_h = Math.sqrt(3) * size;
    const hex_x = hexes[key]['X'];
    const hex_y = hexes[key]['Y'];
    const points = pointCoords(hex_x, hex_y, hex_w, hex_h);

    d3.select(svg_overlay.node())
        .append('polyline')
        .attr('id', key)
        .attr('class', 'hex')
        .attr('fill', '#ffffff')
        .attr('points', points);
}

function getInfluence() {

    planet_tracker.forEach(p => {
        let name = p['Name'];
        let hex = p['Hex'];
        let sys = p['System'];
        let hw = p['Homeworld'];
        let pgov = p['Planetary Government'];
        let pcvi = p['PCVI'];
        let factions = {};
        let local_assets = p['Local Assets'];

        // Influence from local assets
        local_assets.forEach(a => {
            let asset = asset_objects[a];
            let isboi = asset['name'] === 'Base Of Influence';
            let stealth = asset['stealth'];
            let fac = asset['faction'];
            let tag = faction_tracker[fac]['Tag'];
            let fac_tag_mod = tags[tag]['infl_mod'];
            let infl = isboi ? parseFloat(asset['hp']) * fac_tag_mod : fac_tag_mod;

            if (stealth) {
                if (tag === 'Secretive') {
                    infl *= 0.75;
                } else {
                    infl *= 0.5;
                }
            }

            if (hasProp(factions, fac)) {
                factions[fac]['INFL'] += infl;
            } else {
                factions[fac] = {'INFL': infl};
            }
        });

        // Influence from Planetary Government
        if (pgov !== '') {
            let tag = faction_tracker[pgov]['Tag'];
            let fac_tag_mod = tags[tag]['infl_mod'];
            if (hasProp(factions, pgov)) {
                factions[pgov]['INFL'] += 2 * fac_tag_mod;
            } else {
                factions[pgov] = {'INFL': 2 * fac_tag_mod};
            }
        }

        // Influence from Homeworld
        if (hw !== '') {
            if (hasProp(factions, hw)) {
                factions[hw]['INFL'] += 10;
            } else {
                factions[hw] = {'INFL': 10};
            }
        }

        // PCVI * Faction Presence
        for (let fac in factions) {
            if (hasProp(factions, fac)) {
                if (pgov === fac) {
                    factions[fac]['INFL'] *= pcvi[0];
                } else {
                    factions[fac]['INFL'] *= pcvi[1];
                }
            }
            factions[fac]['INFL'] = parseFloat((factions[fac]['INFL']).toFixed(1));
            faction_tracker[fac]['INFL'] += factions[fac]['INFL'];
        }

        influence_tracker[name] = {
            'Hex': hex,
            'System': sys,
            'PCVI': pcvi,
            'Factions': factions
        };
    });

    Object.values(influence_tracker).forEach(planet => {
        let sys = planet['System'];
        let factions = planet['Factions'];
        for (let fac in factions) {
            if (hasProp(factions, fac)) {
                if (hasProp(system_tracker[sys]['Factions'], fac)) {
                    system_tracker[sys]['Factions'][fac]['INFL'] += factions[fac]['INFL'];
                } else {
                    system_tracker[sys]['Factions'][fac] = {'INFL': factions[fac]['INFL']};
                }
            }
        }
    });
}

function drawSystemNames() {

    let i = 0;

    // for (let sys in system_tracker) {
    //     if (hasProp(system_tracker, sys)) {
    //         system_objects[sys] = new SystemName(i, sys);
    //         i++;
    //     }
    // }

    for (let hex in hexes) {
        if (hasProp(hexes, hex)) {
            if (hasProp(hexes[hex], 'Name')) {
                system_objects[hex] = new SystemName(i, hexes[hex]['Name'], hex);
            } else {
                system_objects[hex] = new SystemName(i, '', hex);
            }
            i++;
        }
    }
}

function drawPlanetNames() {

    planet_tracker.forEach((planet, i) => {
        let id = `planet-${i}`;
        planet_objects[id] = new PlanetName(id, planet);
    });

    recolorPlanetNames();
}

function drawAssets() {
    let counter = 0;

    planet_tracker.forEach(planet => {
        let location = planet['Name Constructor'];
        let local_assets = asset_tracker.filter((asset) => asset['Location'] === location);
        let hex_id = 'hex-' + planet['Hex'];
        let idx = planet['idx'];
        let num_planets = planet['total'];

        // Assets
        if (local_assets) {
            local_assets.sort((a, b) =>
                a['Owner'] > b['Owner']
                    ? 1
                    : a['Owner'] === b['Owner']
                    ? a['Asset'] > b['Asset']
                        ? 1
                        : a['Asset'] === b['Asset']
                            ? a['HP'] > b['HP']
                                ? 1
                                : -1
                            : -1
                    : -1
            );

            local_assets.forEach((asset, i) => {
                let pos = getPosition(hex_id, idx, num_planets, i);
                let id = 'asset-' + counter.toString().padStart(3, '0');
                planet['Local Assets'].push(id);
                counter += 1;
                asset_objects[id] = new Asset(id, asset, hex_id, pos, planet['Name Constructor']);
            });
        }
    });

    reorderAssets();
    drawSystemNames();
    drawPlanetNames();
    getInfluence();
    sortFactionTable();
    sortBy('influence');
}

function getFactions() {
    let url_faction_tracker =
        'https://docs.google.com/spreadsheets/d/e/2PACX-1vRCK-QRRccgk3_twQSIyfGU3qzuqyPB6WSb4_KktKyV6AzAmm7ioUBf-wddvLuaToxr5CVWy4tRiAS7/pub?gid=1760255261&single=true&output=tsv';
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            let json = tsvJSON(this.responseText);
            json.forEach(j => {
                faction_tracker[j['Faction']] = j;
                faction_tracker[j['Faction']]['INFL'] = 0;
            });
        }
    };

    xhttp.open('GET', url_faction_tracker, true);
    xhttp.send();
}

function getAssets() {
    const url_asset_tracker =
        'https://docs.google.com/spreadsheets/d/e/2PACX-1vRCK-QRRccgk3_twQSIyfGU3qzuqyPB6WSb4_KktKyV6AzAmm7ioUBf-wddvLuaToxr5CVWy4tRiAS7/pub?gid=2128046628&single=true&output=tsv';
    const xhttp_dyn_assets = new XMLHttpRequest();
    xhttp_dyn_assets.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            asset_tracker = tsvJSON(this.responseText);
            drawAssets();
        }
    };
    xhttp_dyn_assets.open('GET', url_asset_tracker, true);
    xhttp_dyn_assets.send();
}

function getPlanets() {
    const url_planet_tracker =
        'https://docs.google.com/spreadsheets/d/e/2PACX-1vRCK-QRRccgk3_twQSIyfGU3qzuqyPB6WSb4_KktKyV6AzAmm7ioUBf-wddvLuaToxr5CVWy4tRiAS7/pub?gid=464173844&single=true&output=tsv';
    const xhttp_dyn_planets = new XMLHttpRequest();
    xhttp_dyn_planets.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            planet_tracker = tsvJSON(this.responseText);

            planet_tracker.forEach(p => {
                p['Local Assets'] = [];
                p['Tags'] = p['Tags'].split(',').map(tag => {
                    return tag.trim();
                });

                let tl_mod = infl_tl_mod[p['TL']];
                let pop_mod = infl_pop_mod[p['Population']];
                let pcvi_mod = [1, 1];
                p['Tags'].forEach(t => {
                    if (t !== '') {
                        let mod;
                        if (hasProp(p_tags, t)) {
                            mod = p_tags[t]['infl_mod'];
                        } else {
                            mod = 1;
                        }
                        if (mod < -1) {
                            if (t === 'Secret Masters') {
                                pcvi_mod[0] -= 0.1;
                                pcvi_mod[1] += 0.1;
                            } else {
                                pcvi_mod[0] += 0.1;
                                pcvi_mod[1] -= 0.1;
                            }
                        } else {
                            pcvi_mod = pcvi_mod.map(m => {
                                return m + mod;
                            });
                        }
                    }
                });
                pcvi_mod = pcvi_mod.map(m => {
                    return Math.max(m, 0);
                });
                p['PCVI'] = pcvi_mod.map(m => {
                    return parseFloat((m * tl_mod * pop_mod).toFixed(1));
                });
                if (!hasProp(system_tracker, p['System'])) {
                    system_tracker[p['System']] = {
                        'Planets': [p['Name']],
                        'Hex': p['Hex'],
                        'num_planets': 1,
                        'Factions': {}
                    };

                    hexes['hex-' + p['Hex']]['Name'] = p['System'];
                } else {
                    system_tracker[p['System']]['Planets'].push(p['Name']);
                    system_tracker[p['System']]['num_planets'] += 1;
                }
            });

            for (let hex in hexes) {
                let current_hex = hex;
                let num_planets = planet_tracker.filter((planet) => planet['Hex'] === current_hex.replace('hex-', ''))
                    .length;

                if (num_planets) {
                    let local_counter = 0;

                    planet_tracker.forEach(p => {
                        if (p['Hex'] === current_hex.replace('hex-', '')) {
                            p['total'] = num_planets;
                            p['idx'] = local_counter;
                            local_counter++;
                        }
                    });
                }
            }
            getAssets();
        }
    };
    xhttp_dyn_planets.open('GET', url_planet_tracker, true);
    xhttp_dyn_planets.send();
}

function onViewerOpen() {
    document.querySelector('#osd > div > div:nth-child(2) > div > div > div:nth-child(5)').style.display = 'none';
    let home = document.querySelector('#osd > div > div:nth-child(2) > div > div > div:nth-child(4)');
    let zoomout = document.querySelector('#osd > div > div:nth-child(2) > div > div > div:nth-child(3)');
    home.parentNode.insertBefore(home, zoomout);

    document.addEventListener('keydown', event => {
        if (event.keyCode === 27) {
            delFilter();
            if (show_sidebar) {
                toggleSidebar();
            }
        }
    });

    for (let key in hexes) {
        if (hasProp(hexes, key)) {
            makeHexOverlays(key);
        }
    }

    getFactions();
    getPlanets();
}
