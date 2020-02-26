// TODO: REWRITE TO ONLY MAINTAIN 1 TRACKER

class SystemName {
    constructor(id, system) {
        this.id = 'system' + id.toString().padStart(2, '0');
        this.system_name = system;
        this.hex_id = 'hex_' + system_tracker[system]['Hex'];

        this.hex_x = hexes[this.hex_id]['X'];
        this.hex_y = hexes[this.hex_id]['Y'];
        this.num_planets = system_tracker[system]['num_planets'];
        this.x_offset = 0;
        this.y_offset = -0.046;

        this.text_color = '#7c7c7c';
        let font_weight = 'normal';
        let w_factor = 1;
        let padding;
            let style_str;
            if (isFirefox) {
                style_str = 'font-size: 0.02px; font-size-adjust: 0.2';
                padding = 0.0015;
            } else {
                style_str = 'font-size: 0.0056px';
                padding = 0.0005;
            }

            let system_name_SVG = d3.select(svg_overlay.node()).append('svg:text')
                    .text(this.system_name.toUpperCase())
                    .attr('style', style_str)
                    .attr('id', this.id + '_name')
                    .attr('font-family', 'D-DIN')
                    .attr('fill', '#7c7c7c')
                    .attr('text-anchor', 'middle')
                    .attr('x', this.hex_x + this.x_offset)
                    .attr('y', this.hex_y + this.y_offset);
        this.text = getElem(this.id + '_name');
        let box_width = system_name_SVG.node().getComputedTextLength();

        new SystemNameHighlight(
            this.id + '_highlight',
            this.hex_x,
            this.hex_y,
            this.x_offset,
            this.y_offset,
            w_factor,
            box_width,
            padding
        );
        this.highlight_box = viewer.getOverlayById(this.id + '_highlight');

        // noinspection JSUnusedLocalSymbols
        new OpenSeadragon.MouseTracker({
            element: this.id + '_highlight',
            enterHandler: () => {
                getElem('system_tip_name').innerHTML = `<b>${this.system_name}</b>`;
                getElem('system_tip').style.display = 'block';
                getElem('system_tip').style.zIndex = '3';
                system_tip_on = true;
                updateSystemChart(this.system_name);

                let system_objects_chart_config = {
                    chart: {
                        container: "#system_objects_chart_container",
                        rootOrientation: 'WEST', // NORTH || EAST || WEST || SOUTH
                        levelSeparation: 40,
                        siblingSeparation: 2,
                        subTeeSeparation: 10,
                        nodeAlign: "BOTTOM",
                        connectors: {
                            type: "step",
                            style: {
                                "stroke-width": 1,
                                "stroke-linecap": "round",
                                "stroke-dasharray": '. ',
                                "stroke": "#777"
                            }
                        },
                        node: {
                            HTMLclass: 'system_object'
                        }
                    },
                    nodeStructure: system_objects[this.system_name]
                };
                system_objects_chart = new Treant(system_objects_chart_config);
                console.log(system_objects_chart)
            },
            exitHandler: () => {
                getElem('system_tip').style.display = 'none';
                system_tip_on = false;
                system_objects_chart.destroy();
            },
            clickHandler: () => {
                window.open('https://far-verona.fandom.com/wiki/' + this.system_name);
            }
        });
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
        })
    }
}

class PlanetName {
    constructor(id, planet) {
        this.planet = planet;
        this.id = 'planet_' + id.toString().padStart(2, '0');
        this.hex_id = 'hex_' + planet['Hex'];
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

        let planet_name_SVG = d3
            .select(svg_overlay.node())
            .append('svg:text')
            .text(this.planet_name.toUpperCase())
            .attr('style', style_str)
            .attr('id', this.id + '_name')
            .attr('class', 'planet')
            .attr('font-family', 'D-DIN')
            .attr('font-weight', font_weight)
            .attr('fill', this.text_color)
            .attr('text-anchor', 'middle')
            .attr('x', this.hex_x + this.x_offset)
            .attr('y', this.hex_y + this.y_offset + 0.011)
            .attr('pointer-events', 'none');
        this.text = getElem(this.id + '_name');
        let box_width = planet_name_SVG.node().getComputedTextLength();
        d3.select(svg_overlay.node())
            .insert('rect', '#' + this.id + '_name')
            .attr('id', this.id + '_color')
            .attr('class', 'planet')
            .attr('fill', this.box_color)
            .attr('x', this.hex_x + this.x_offset - (w_factor * box_width) / 2 - padding)
            .attr('y', this.hex_y + this.y_offset + 0.00812)
            .attr('width', (box_width + 2 * padding) * w_factor)
            .attr('height', 0.0034)
            .attr('pointer-events', 'none');
        this.color_box = getElem(this.id + '_color');

        new PlanetNameHighlight(
            this.id + '_highlight',
            this.hex_x,
            this.hex_y,
            this.x_offset,
            this.y_offset,
            w_factor,
            box_width,
            padding
        );
        this.highlight_box = viewer.getOverlayById(this.id + '_highlight');

        // noinspection JSUnusedLocalSymbols
        new OpenSeadragon.MouseTracker({
            element: this.id + '_highlight',
            enterHandler: () => {
                let display_name = this.planet_name;
                if (this.planet_name === 'The Guild Dyson Sphere') {
                    display_name = 'Ṫ̠͇̝̤̏͊͛̈́̐̍h̖̯͉͓͉̝̘̝͇̥̒͐̿̅̊̅ẻ̬͚̞̱͙̮̂͗͆̄̈́́ G̟̪̳̳̗͇̗͍͔͓̥̎̃̑̆͐ù͍̪̜̳̱͈͎͔̏͑́̏̏̏̔͐̃́ͅi̲̠͍͙̗̮̞̳̞͌͒͂́͐͊̉̄̐̀̚l͇̥͍̤̮̫̏́͂̿d̮͇̯͙̝̗̤̩̥̯̩̿̽͛͛̋͐̈́̚ D̤̗̙̠͇̀̾̇̌̐̈́y͉̙͇̝͓͔͋̾̓̏͌͂͌͒̉̚s͉͖̣̜̬̋̂͊͊̆̌̉̽̈ȯ̪̟̪̦͂͋̋̈́̒͑́̐͌̚̚n̰͍̦̩͓͉͕̭͍̆̅̿̉́͗̇̇̏̃͑͑ Ŝ̲̞̘̬̓́̈̉͗́̆͐͑̐̿p͔͍͙̲̓̿͌͆͆̿͋̆̈ͅh̦͕̭̥̤̪̯̱̤͐̆̈́̌̐͑̿e͚̱̭̗̣̍̅̑̽̀̂̓͂̚r̖̙̬̭̤̙̬̰̗͚̩̘̿̋́͛̀e̞̙̭̝̗͓͔͔͙̤͇̬̐̓͂͌̋̄̈́̌̑͆͋̑';
                }
                getElem('planet_tip_name').innerHTML = display_name;
                getElem('planet_tip_sys').innerHTML = this.hex_id.replace('hex_', '') + ' / ' + this.system_name;
                getElem('planet_tip').style.display = 'block';
                getElem('planet_tip').style.zIndex = '3';
                planet_tip_on = true;
                if (this.planet_name === 'The Guild Dyson Sphere') {
                    this.tags = 'tags more like HAX amirite';
                    this.atmo = 'chill';
                    this.temp = 'fever';
                    this.bio = 'sexy af';
                    this.tl = '9001';
                    this.pop = 'ok boomer';
                    this.pcvi = ['u wot m8', 'u wot m8'];
                    let options = {
                        labels: ['The Guild'],
                        colors: ['#f70094'],
                        dataLabels: {
                            formatter: () => {
                                return '420.0%';
                            },
                            style: {
                                colors: ['#ffffff']
                            }
                        }
                    };
                    planet_tip_chart.updateSeries([6969]);
                    planet_tip_chart.updateOptions(options);
                    getElem('planet_tip_infl').innerHTML = '6969';
                } else {
                    updatePlanetChart(this.planet_name);
                }
                getElem('planet_tip_atmo').innerHTML = this.atmo;
                getElem('planet_tip_temp').innerHTML = this.temp;
                getElem('planet_tip_bio').innerHTML = this.bio;
                getElem('planet_tip_tl').innerHTML = this.tl;
                getElem('planet_tip_pcvi').innerHTML = this.pcvi[0] !== this.pcvi[1] ? `${this.pcvi[1]} (${this.pcvi[0]})` : this.pcvi[0];
                getElem('planet_tip_pop').innerHTML = this.pop;
                getElem('planet_tip_tags').innerHTML = this.tags;
                replaceInactiveFactionNames(this.planet_name, owner_str, hw_str);
            },
            exitHandler: () => {
                getElem('planet_tip').style.display = 'none';
                planet_tip_on = false;
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

    fontweight(weight) {
        this.text.setAttribute('font-weight', weight)
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
        })
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
        this.status = asset["Status"];
        this.status_str = statuses[this.status];
        this.inactive = this.status === "Inactive";
        this.summoning = this.status === "Summoning";
        this.imperial = this.status === "Imperial Asset";
        let name_str = this.name;
        if (this.imperial) {
            name_str = `Imperial ${name_str}`;
        }
        if (this.stealth) {
            name_str = `<mark>${name_str}</mark>`;
        }
        this.type = this.isboi ? '' : asset['Type'];
        this.cost = this.isboi ? 'Special' : asset['Cost'] !== 'n/a' ? asset['Cost'] : '-';
        this.tl = this.isboi ? '-' : assets[this.name]['TL'] !== 'n/a' ? assets[this.name]['TL'] : '-';
        this.atk = this.isboi ? '-' : asset['Attack'].replace('None', '-');
        this.def = this.isboi ? '-' : asset['Counter'].replace('None', '-');
        this.stat = this.isboi ? '' : asset['W/C/F'];
        this.stat_tier = this.isboi ? '-' : assets[this.name]['STAT_TIER'];
        this.perm = this.isboi ? '' : assets[this.name]['PERM'] !== '' ? 'Needs governmental permission.' : '';
        this.special = this.isboi ? '' : assets[this.name]['SPECIAL']
        this.range = this.isboi ? 0 : assets[this.name]['RANGE'];
        if (!this.isboi && this.range === 0 && faction_tracker[this.faction]['Tag'] === 'Mercenary Group') {
            this.range = 1;
        }
        this.hex_id = hex_id;
        this.x = pos['asset']['X'];
        this.y = pos['asset']['Y'];
        this.size = box_size / 1.1;
        this.location = location;

        // Create asset pool entry
        createAssetPoolEntry(this);

        // Highlight range of movement assets
        this.highlightHexes = function(hex_id, range) {
            let hex_list = hexes[hex_id][range];
            hex_list.forEach(h => {getElem(h).style.opacity = '0.05'});
        };

        // Render asset
        d3.select(svg_overlay.node())
            .append('rect')
            .attr('id', this.id + '_color')
            .attr('class', 'asset ' + factions[this.faction]['short'].toLowerCase())
            .attr('fill', factions[this.faction]['color'])
            .attr('x', this.x)
            .attr('y', this.y)
            .attr('width', this.size)
            .attr('height', this.size);
        this.color_box = getElem(this.id + '_color');

        d3.select(svg_overlay.node())
            .append('svg:image')
            .attr('id', this.id + '_alpha')
            .attr('class', 'asset ' + factions[this.faction]['short'].toLowerCase())
            .attr('xlink:href', 'assets_alpha/' + this.name + '.png')
            .attr('x', this.x)
            .attr('y', this.y)
            .attr('width', this.size)
            .attr('height', this.size);
        this.alpha_box = getElem(this.id + '_alpha');
        if (this.summoning) {
            this.alpha_box.style.opacity = '0.5';
        }

        if (this.stealth) {
            d3.select(svg_overlay.node())
                .append('svg:image')
                .attr('id', this.id + '_stealth')
                .attr('class', 'asset ' + factions[this.faction]['short'].toLowerCase())
                .attr('xlink:href', 'assets_alpha/Stealth.png')
                .attr('x', this.x)
                .attr('y', this.y)
                .attr('width', this.size)
                .attr('height', this.size);
        }
        this.stealth_box = getElem(this.id + '_stealth');

        if (this.imperial) {
            d3.select(svg_overlay.node())
                .append('svg:image')
                .attr('id', this.id + '_imperial')
                .attr('class', 'asset ' + factions[this.faction]['short'].toLowerCase())
                .attr('xlink:href', 'assets_alpha/Imperial.png')
                .attr('x', this.x)
                .attr('y', this.y)
                .attr('width', this.size)
                .attr('height', this.size);
        }
        this.imperial_box = getElem(this.id + '_imperial');

        if (isInactive(this.faction)) {
            d3.select(svg_overlay.node())
                .append('svg:image')
                .attr('id', this.id + '_inactive')
                .attr('class', 'asset ' + factions[this.faction]['short'].toLowerCase())
                .attr('xlink:href', 'assets_alpha/Inactive.png')
                .attr('x', this.x)
                .attr('y', this.y)
                .attr('width', this.size)
                .attr('height', this.size);
        }
        this.inactive_box = getElem(this.id + '_inactive');

        // Add highlight
        new AssetHighlight(this.id, this.faction, pos['highlight']['X'], pos['highlight']['Y']);
        this.highlight_box = viewer.getOverlayById(id + '_highlight');

        // Get tooltip
        const hex_overlays = document.getElementsByClassName('hex');
        
        // noinspection JSCheckFunctionSignatures
        new OpenSeadragon.MouseTracker({
            element: id + '_highlight',
            enterHandler: () => {
                getElem('tip_fac').innerHTML = this.faction;
                getElem('tip_stats').innerHTML = this.isboi ? '' : this.type + ', ' + this.stat + ' ' + this.stat_tier;
                getElem('tip_name').innerHTML = name_str;
                getElem('tip_hp').innerHTML = this.hp + '/' + this.max_hp;
                getElem('tip_cost').innerHTML = this.cost;
                getElem('tip_tl').innerHTML = this.tl;
                getElem('tip_atk').innerHTML = this.atk;
                getElem('tip_cnt').innerHTML = this.def;

                if (this.stealth) {
                    getElem('tip_row_stealth').style.display = 'table-row';
                } else {
                    getElem('tip_row_stealth').style.display = 'none';
                }
                if (this.special !== '') {
                    getElem('tip_special').innerHTML = this.special;
                    getElem('tip_row_special').style.display = 'table-row';
                } else {
                    getElem('tip_row_special').style.display = 'none';
                }
                if (this.status !== '') {
                    getElem('tip_status_label').innerHTML = `<b>${this.status}</b>`;
                    getElem('tip_status').innerHTML = this.status_str;
                    getElem('tip_row_status').style.display = 'table-row';
                } else {
                    getElem('tip_row_status').style.display = 'none';
                }
                if (this.perm !== '') {
                    getElem('tip_perm').innerHTML = '<i>' + this.perm + '</i>';
                    getElem('tip_row_perm').style.display = 'table-row';
                } else {
                    getElem('tip_row_perm').style.display = 'none';
                }

                getElem('tip').style.display = 'block';
                tip_on = true;

                if (this.range > 0) {
                    this.highlightHexes(this.hex_id, this.range);
                }
            },
            exitHandler: () => {
                getElem('tip').style.display = 'none';
                getElem('tip_fac').innerHTML = '';
                getElem('tip_stats').innerHTML = '';
                getElem('tip_name').innerHTML = '';
                getElem('tip_hp').innerHTML = '';
                getElem('tip_cost').innerHTML = '';
                getElem('tip_tl').innerHTML = '';
                getElem('tip_atk').innerHTML = '';
                getElem('tip_cnt').innerHTML = '';
                getElem('tip_special').innerHTML = '';
                getElem('tip_perm').innerHTML = '';
                tip_on = false;
                [...hex_overlays].forEach(h => {h.style.opacity = '0'});
            },
            clickHandler: () => {

                if (tip_on) {
                    tip_on = false;
                    $('#tip').fadeOut(200);
                } else {
                    tip_on = true;
                    $('#tip').fadeIn(200);
                }
            }
        });
    }

    update(asset_x, asset_y, highlight_x, highlight_y) {

        if (!show_inactive && isInactive(this.faction)) {
            this.highlight_box.style.display = 'none';
            this.color_box.style.display = 'none';
            this.alpha_box.style.display = 'none';
            if (this.stealth_box) {
                this.stealth_box.style.display = 'none';
            }
            if (this.imperial_box) {
                this.imperial_box.style.display = 'none';
            }
            if (this.inactive_box) {
                this.inactive_box.style.display = 'none';
            }
        } else {
            this.highlight_box.update(new OpenSeadragon.Rect(highlight_x, highlight_y, box_size, box_size), null);
            this.highlight_box.style.display = 'block';
            this.color_box.setAttribute('x', asset_x);
            this.color_box.setAttribute('y', asset_y);
            this.color_box.style.display = 'block';
            this.alpha_box.setAttribute('x', asset_x);
            this.alpha_box.setAttribute('y', asset_y);
            this.alpha_box.style.display = 'block';
            if (this.summoning) {
                this.alpha_box.style.opacity = '0.5';
            }
            if (this.stealth_box) {
                this.stealth_box.setAttribute('x', asset_x);
                this.stealth_box.setAttribute('y', asset_y);
                this.stealth_box.style.display = 'block';
            }
            if (this.imperial_box) {
                this.imperial_box.setAttribute('x', asset_x);
                this.imperial_box.setAttribute('y', asset_y);
                this.imperial_box.style.display = 'block';
            }
            if (this.inactive_box) {
                this.inactive_box.setAttribute('x', asset_x);
                this.inactive_box.setAttribute('y', asset_y);
                this.inactive_box.style.display = 'block';
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
        highlight.id = this.id + '_highlight';
        highlight.className = 'highlight ' + factions[this.faction]['short'].toLowerCase();

        viewer.addOverlay({
            element: highlight,
            location: new OpenSeadragon.Rect(this.x, this.y, box_size, box_size)
        });
    }
}

function createAssetPoolEntry(data) {

    let asset_class_str;
    let asset_stealth_str;
    if (!data.stealth) {
        asset_class_str = "asset-table";
        asset_stealth_str = "-";
    } else {
        asset_class_str = "asset-table stealth";
        asset_stealth_str = "stealthed";
    }

    let color = factions[data.faction]['color'];
    let type_stat_str = data.isboi ? '' : data.type + ', ' + data.stat + ' ' + data.stat_tier;

    let asset_div = `<div class="asset-item" id="${data.id}_pool" data-faction="${data.faction.replace('\'', '&#39;')}" data-stealth="${asset_stealth_str}" onclick="toggleHighlightAsset(this.id)" onmouseover="highlightAssetTable(this.id)" onmouseleave="stopHighlightAssetTable(this.id)">` +
        `<table id="${data.id}_pool_table" class="${asset_class_str}">` +
        "<tr>" +
        `<td class="fac-color-td" rowspan="4" style="background-color: ${color}">` +
        "</td>" +
        "<td class='top-row-td' colspan='5'>" +
        "<div class='location-div'>" +
        data.location +
        "</div>" +
        "<div class='type-stat-div'>" +
        type_stat_str +
        "</div>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<td class='name-td' colspan='5'>" +
        data.name +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<td class='hp-td'>" +
        data.hp + "/" + data.max_hp +
        "</td>" +
        "<td class='cost-td'>" +
        data.cost +
        "</td>" +
        "<td class='tl-td'>" +
        data.tl +
        "</td>" +
        "<td class='atk-td'>" +
        data.atk +
        "</td>" +
        "<td class='def-td'>" +
        data.def +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<td class='hp-td' style='padding-bottom: 4px'>" +
        "<img class='icon-pool' src='img/hp_icon.png' alt='' />" +
        "</td>" +
        "<td class='cost-td' style='padding-bottom: 4px'>" +
        "<img class='icon-pool' src='img/cost_icon.png' alt='' />" +
        "</td>" +
        "<td class='tl-td' style='padding-bottom: 4px'>" +
        "<img class='icon-pool' src='img/tl_icon.png' alt='' />" +
        "</td>" +
        "<td class='atk-td' style='padding-bottom: 4px'>" +
        "<img class='icon-pool' src='img/atk_icon.png' alt='' />" +
        "</td>" +
        "<td class='def-td' style='padding-bottom: 4px'>" +
        "<img class='icon-pool' src='img/def_icon.png' alt='' />" +
        "</td>" +
        "</tr>" +
        "</table>" +
        "</div>";

    let asset_pool = getElem('assetPool');
    asset_pool.insertAdjacentHTML('beforeend', asset_div);

    if (isInactive(data.faction)) {
        getElem(`${data.id}_pool`).style.display = 'none';
    }
}

function getElem(id) {
    return document.getElementById(id);
}

function hasProp(obj, key) {
    return obj.hasOwnProperty(key)
}

function isInactive(faction) {
    if (faction === "The Guild" || faction === 'Unclaimed') {
        return true
    } else {
        return faction_tracker[faction]["Status"] === "Inactive"
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
                break
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
    let input = getElem("search-bar");
    let filter = input.value.toUpperCase().split(" ");
    let assets = getElem("assetPool").getElementsByClassName("asset-item");

    recolorPlanetNames();
    Object.values(planet_obects).forEach(planet => {
        let full_name = planet.pgov;
        if (full_name !== '') {
            let short_name = factions[full_name]['short'];
            let search_name = factions[full_name]['search'];

            let search_hits = new Array(filter.length);
            for (let k=0; k<search_hits.length; k++) {
                search_hits[k] = false;
            }

            for (let j=0; j<filter.length; j++) {
                let search_term = filter[j].replace(/[^A-Za-z_]/g,"");
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
        let asset_div = getElem(highlighted_asset + '_pool');
        let asset_table = getElem(highlighted_asset + '_pool_table');
        asset_div.style.backgroundColor = '#222';
        if (asset_table.classList.contains('stealth')) {
            asset_table.style.backgroundColor = '#293e42';
        } else {
            asset_table.style.backgroundColor = '#262626';
        }
        highlighted_asset = '';
    }

    for (let i=0; i<assets.length; i++) {

        let id = assets[i].getAttribute('id').replace('_pool', '');

        let name = assets[i].getElementsByClassName("name-td")[0];
        let nameValue = name.textContent || name.innerText;

        let facValue = assets[i].getAttribute('data-faction');

        let stealthValue = assets[i].getAttribute('data-stealth');

        let atk = assets[i].getElementsByClassName("atk-td")[0];
        let atkValue = atk.textContent || atk.innerText;

        let loc = assets[i].getElementsByClassName("location-div")[0];
        let locValue = loc.textContent || loc.innerText;

        let typestat = assets[i].getElementsByClassName("type-stat-div")[0];
        let typestatValue = typestat.textContent || typestat.innerText;

        let search_hits = new Array(filter.length);
        for (let k=0; k<search_hits.length; k++) {
            search_hits[k] = false;
        }

        for (let j=0; j<filter.length; j++) {
            let search_term = filter[j].replace(/[^A-Za-z_]/g,"");
            if (nameValue.toUpperCase().indexOf(search_term) > -1 ||
                facValue.toUpperCase().indexOf(search_term) > -1  ||
                stealthValue.toUpperCase().indexOf(search_term) > -1  ||
                typestatValue.toUpperCase().indexOf(search_term) > -1 ||
                atkValue.toUpperCase().indexOf(search_term) > -1 ||
                locValue.toUpperCase().indexOf(search_term) > -1) {
                search_hits[j] = true;
            }
        }

        if ((!isInactive(facValue) || show_inactive) && !search_hits.includes(false)) {
            assets[i].style.display = "block";
            asset_objects[id].hide(false);
        } else {
            assets[i].style.display = "none";
            asset_objects[id].hide(true);
        }
    }

    if (input.value !== "") {
        document.getElementById("del_button").style.display = "block";
    } else {
        document.getElementById("del_button").style.display = "none";
    }
}

function delFilter() {
    let input = document.getElementById("search-bar");
    input.value = "";
    filterList();
    recolorPlanetNames();
}

function visibilityToggleStyling(inout) {
    let toggle = getElem('visibilityToggle');

    if (inout === 'in') {
        if (show_inactive) {
            toggle.style.background = "url('img/hide_hover.png')";
            toggle.style.backgroundSize = '35px';
        } else {
            toggle.style.background = "url('img/show_hover.png')";
            toggle.style.backgroundSize = '35px';
        }
    } else {
        if (show_inactive) {
            toggle.style.background = "url('img/show_hover.png')";
            toggle.style.backgroundSize = '35px';
        } else {
            toggle.style.background = "url('img/hide_rest.png')";
            toggle.style.backgroundSize = '35px';
        }
    }
}

function toggleFactionTable() {
    show_factionTable = !show_factionTable;
    let col = getElem('factionsCol');
    let toggle = getElem('factionToggle');
    if (show_factionTable) {
        col.style.right = '10px';
        toggle.style.transform = 'rotate(0deg)';
    } else {
        col.style.right = '-210px';
        toggle.style.transform = 'rotate(-90deg)';
    }
}

function toggleSidebar() {
    show_sidebar = !show_sidebar;
    let sidebar = getElem('sidebar');
    let toggle = getElem('sidebarToggle');
    if (show_sidebar) {
        sidebar.style.left = '0';
        toggle.style.left = '405px';
        toggle.style.transform = 'rotate(90deg)';
    } else {
        sidebar.style.left = '-401px';
        toggle.style.left = '5px';
        toggle.style.transform = 'rotate(-90deg)';
    }
}

function replaceInactiveFactionNames(planet, fac, hw) {

    if (planet === 'The Guild Dyson Sphere') {
        getElem('planet_tip_fac').innerHTML = '🔥🔥🔥';
    } else if ((isInactive(fac) && !show_inactive) || fac === 'Unclaimed') {
        getElem('planet_tip_fac').innerHTML = 'Unclaimed';
    } else {
        getElem('planet_tip_fac').innerHTML = fac + hw;
    }
}

function recolorPlanetNames() {

    Object.values(planet_obects).forEach(planet => {
        if (planet.pgov === '' || (isInactive(planet.pgov) && !show_inactive)) {
            planet.color('#7c7c7c', '#222222');
            planet.fontweight('normal')
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
        let hex_id = 'hex_' + planet['Hex'];
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

    reorderAssets();
    sortFactionTable();
    recolorPlanetNames();

    if (highlighted_asset !== '') {
        let asset = asset_objects[highlighted_asset];
        if (!show_inactive && isInactive(asset.faction)) {
            toggleHighlightAsset(highlighted_asset + '_pool');
        }
    } else {
        filterList();
    }
}

function hidePlanets() {
    Object.values(planet_obects).forEach(planet => {
        planet.color('#7c7c7c', '#222222');
    })
}

function toggleHighlightAsset(id) {
    let asset_id = id.replace('_pool', '');
    let asset_div = getElem(id);
    let asset_table = getElem(id + '_table');
    if (highlighted_asset === asset_id) {
        asset_objects[asset_id].stopHighlightAsset();
        if (asset_table.classList.contains('stealth')) {
            asset_table.style.backgroundColor = '#293e42';
        } else {
            asset_table.style.backgroundColor = '#262626';
        }
        asset_div.style.backgroundColor = '#222';
        recolorPlanetNames()
        highlighted_asset = '';
    } else {
        if (highlighted_asset !== '') {
            let old_asset_div = getElem(highlighted_asset + '_pool');
            let old_asset_table = getElem(highlighted_asset + '_pool_table');
            old_asset_div.style.backgroundColor = '#222';
            if (old_asset_table.classList.contains('stealth')) {
                old_asset_table.style.backgroundColor = '#293e42';
            } else {
                old_asset_table.style.backgroundColor = '#262626';
            }
            asset_objects[highlighted_asset].stopHighlightAsset();
        }
        asset_objects[asset_id].highlightAsset();
        if (asset_table.classList.contains('stealth')) {
            asset_table.style.backgroundColor = '#3c6974';
            asset_div.style.backgroundColor = '#3c6974';
        } else {
            asset_table.style.backgroundColor = '#404040';
            asset_div.style.backgroundColor = '#404040';
        }
        hidePlanets();
        highlighted_asset = asset_id;
    }
}

function highlightAssetTable(id) {
    let asset_id = id.replace('_pool', '');
    let asset_table = getElem(asset_id + '_pool_table');
    if (asset_id !== highlighted_asset) {
        if (asset_table.classList.contains('stealth')) {
            asset_table.style.backgroundColor = '#2e5058';
        } else {
            asset_table.style.backgroundColor = '#2f2f2f';
        }
    }
}

function stopHighlightAssetTable(id) {
    let asset_id = id.replace('_pool', '');
    let asset_table = getElem(asset_id + '_pool_table');
    if (asset_id !== highlighted_asset) {
        if (asset_table.classList.contains('stealth')) {
            asset_table.style.backgroundColor = '#293e42';
        } else {
            asset_table.style.backgroundColor = '#262626';
        }
    }
}

function sortBy(col) {
    let asset_pool = document.getElementById("assetPool");
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
                inflA === inflB ? (a['name'] > b['name'] ? 1 : -1) : -dir[col]
        } else {
            let valA = a[col].toUpperCase();
            let valB = b[col].toUpperCase();
            return valA > valB ? dir[col] : -dir[col]
        }
    };

    if (dir[col] === -1) {
        temp_assets.sort(compare);
    } else {
        temp_assets.reverse().sort(compare);
    }

    temp_assets.forEach((item) => {
        asset_pool.appendChild(getElem(item['id'] + '_pool'));
    });
}

function sortFactionTable() {
    let table, rows, switching, i, fac_a, fac_b, val_a, val_b, shouldSwitch;
    table = getElem('factionTable');
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

    getElem('info_faction').innerHTML = faction_tracker[faction]['Faction'];
    getElem('info_homeworld').innerHTML = faction_tracker[faction]['Homeworld'];
    getElem('info_force').innerHTML = '<b>' + faction_tracker[faction]['F'] + '</b>';
    getElem('info_cunning').innerHTML = '<b>' + faction_tracker[faction]['C'] + '</b>';
    getElem('info_wealth').innerHTML = '<b>' + faction_tracker[faction]['W'] + '</b>';
    getElem('info_hp').innerHTML =
        '<b>' + faction_tracker[faction]['HP'] + '/' + faction_tracker[faction]['Max HP'] + '</b>';
    getElem('info_income').innerHTML = '<b>' + faction_tracker[faction]['Income'] + '</b>';
    getElem('info_balance').innerHTML = '<b>' + faction_tracker[faction]['Balance'] + '</b>';
    getElem('info_exp').innerHTML = '<b>' + faction_tracker[faction]['EXP'] + '</b>';
    getElem('info_goal').innerHTML = goal;
    getElem('info_goaldesc').innerHTML = goal_desc;
    getElem('info_tag').innerHTML = faction_tracker[faction]['Tag'];
    getElem('info_tagdesc').innerHTML = tags[faction_tracker[faction]['Tag']]["desc"];
    getElem('info_notes').innerHTML = faction_tracker[faction]['Notes'];
    getElem('info_infl_abs').innerHTML = (faction_tracker[faction]['INFL']).toFixed(1);
    getElem('info_infl_rel').innerHTML =
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
        return obj
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
    return [values, options]
}

function updateSectorChart() {
    let [values, options] = processChart(faction_tracker);
    sectorinfluence_chart.updateSeries(values);
    sectorinfluence_chart.updateOptions(options);
    let total_infl = values.reduce((a, b) => a + b, 0);
}

function updateSectorChartOptions(opts) {
    sectorinfluence_chart.updateOptions(opts);
}

function updateSystemChart(system_name) {
    let system_influence = system_tracker[system_name]['Factions'];
    let [values, options] = processChart(system_influence);
    system_tip_chart.updateSeries(values);
    system_tip_chart.updateOptions(options);
    let total_infl = values.reduce((a, b) => a + b, 0);
    updateSystemChartOptions({
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

function updateSystemChartOptions(opts, infl=null) {
    system_tip_chart.updateOptions(opts);
    if (infl) {
        let display_infl = Math.round(infl * 10) / 10;
        document.querySelector('#system_tip_chart > div > svg > text')
            .innerHTML = `<tspan x="210" dy="-0.5em" text-anchor="middle" style="font-size: 24px">${display_infl}</tspan><tspan x="210" dy="1.8em" text-anchor="middle">Total Influence</tspan>`;
    }
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

    // getElem('planet_tip_infl').innerHTML = Math.round(total_infl * 10) / 10;
}

function updatePlanetChartOptions(opts, infl=null) {
    planet_tip_chart.updateOptions(opts);
    if (infl) {
        let display_infl = Math.round(infl * 10) / 10;
        document.querySelector('#planet_tip_chart > div > svg > text')
            .innerHTML = `<tspan x="210" dy="-0.5em" text-anchor="middle" style="font-size: 24px">${display_infl}</tspan><tspan x="210" dy="1.8em" text-anchor="middle">Total Influence</tspan>`;
    }
}

function makeHexOverlays(key) {
    const size = 0.0635;
    const hex_w = 2 * size;
    const hex_h = Math.sqrt(3) * size;
    const hex_x = hexes[key]['X'] - hex_w / 2;
    const hex_y = hexes[key]['Y'] - hex_h / 2;

    d3.select(svg_overlay.node())
        .append('svg:image')
        .attr('id', key)
        .attr('class', 'hex')
        .attr('xlink:href', './img/hex.png')
        .attr('x', hex_x)
        .attr('y', hex_y)
        .attr('width', hex_w)
        .attr('height', hex_h);
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
                factions[fac] = {"INFL": infl};
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
            "Hex": hex,
            "System": sys,
            "PCVI": pcvi,
            "Factions": factions
        }
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

    for (let sys in system_tracker) {
        if (hasProp(system_tracker, sys)) {
            new SystemName(i, sys);
            i++;
        }
    }
}

function drawPlanetNames() {

    planet_tracker.forEach((planet, i) => {
        let id = `planet_${i}`;
        planet_obects[id] = new PlanetName(id, planet);
    });

    recolorPlanetNames();
}

function drawAssets() {
    let counter = 0;

    planet_tracker.forEach(planet => {
        let location = planet['Name Constructor'];
        let local_assets = asset_tracker.filter((asset) => asset['Location'] === location);
        let hex_id = 'hex_' + planet['Hex'];
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
                let id = 'asset_' + counter.toString().padStart(3, '0');
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

function drawPlanets() {
    // TODO: make Planet circles into class

    planet_tracker.forEach(planet => {
        planet["Local Assets"] = [];
        let hex_id = 'hex_' + planet['Hex'];
        let current_idx = planet['idx'];
        let hex_x = hexes[hex_id]['X'];
        let hex_y = hexes[hex_id]['Y'];
        let num_planets = planet['total'];
        let x_offset = planet_to_hex_offsets[num_planets][current_idx]['X'];
        let y_offset = planet_to_hex_offsets[num_planets][current_idx]['Y'];

        // Planet Circle
        let circle_id = planet['Name'] + '_circle';
        let planet_circle = getElem(circle_id);
        if (!planet_circle) {
            let circle_color = '#404040';
            if (hex_id === 'hex_0808') {
                circle_color = factions['The Guild']['color'];
            }

            d3.select(svg_overlay.node())
                .insert('circle', '.hex')
                .attr('id', circle_id)
                .attr('fill', '#222222')
                .attr('stroke', circle_color)
                .style('stroke-width', 0.00065)
                .attr('cx', hex_x + x_offset)
                .attr('cy', hex_y + y_offset)
                .attr('r', 0.011);
        }

        // System Name
    //     let system_id = planet['System'];
    //     let style_str;
    //     if (isFirefox) {
    //         style_str = 'font-size: 0.02px; font-size-adjust: 0.2';
    //     } else {
    //         style_str = 'font-size: 0.0056px';
    //     }
    //     let sys = getElem(system_id);
    //     if (!sys) {
    //         d3.select(svg_overlay.node())
    //             .insert('svg:text', 'circle')
    //             .text(system_id.toUpperCase())
    //             .attr('style', style_str)
    //             .attr('id', system_id)
    //             .attr('font-family', 'D-DIN')
    //             .attr('fill', '#7c7c7c')
    //             .attr('text-anchor', 'middle')
    //             .attr('x', hex_x)
    //             .attr('y', hex_y - 0.046)
    //             .attr('pointer-events', 'none');
    //     }
    });
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
                p['Tags'] = p['Tags'].split(',').map(tag => {
                    return tag.trim()
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
                                return m + mod
                            });
                        }
                    }
                });
                pcvi_mod = pcvi_mod.map(m => {return Math.max(m, 0)});
                p['PCVI'] = pcvi_mod.map(m => {return parseFloat((m * tl_mod * pop_mod).toFixed(1))});
                if (!hasProp(system_tracker, p['System'])) {
                    system_tracker[p['System']] = {
                        'Planets': [p['Name']],
                        'Hex': p['Hex'],
                        'num_planets': 1,
                        'Factions': {}
                    }
                } else {
                    system_tracker[p['System']]['Planets'].push(p['Name']);
                    system_tracker[p['System']]['num_planets'] += 1;
                }
            });

            for (let hex in hexes) {
                let current_hex = hex;
                let num_planets = planet_tracker.filter((planet) => planet['Hex'] === current_hex.replace('hex_', ''))
                    .length;

                if (num_planets) {
                    let local_counter = 0;

                    planet_tracker.forEach(p => {
                        if (p['Hex'] === current_hex.replace('hex_', '')) {
                            p['total'] = num_planets;
                            p['idx'] = local_counter;
                            local_counter++;
                        }
                    })
                }
            }
            drawPlanets();
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
