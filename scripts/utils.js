class Asset {
    constructor(id, asset, hex_id, pos) {
        this.id = id;
        this.name = asset['Asset'];
        this.isboi = this.name === 'Base Of Influence';
        this.faction = asset['Owner'];
        this.hp = asset['HP'];
        this.max_hp = asset['Max HP'];
        this.stealth = asset['ʘ'] !== 'FALSE';
        let stealth_str = this.stealth ? '<mark>' + this.name + ' (Stealthed)</mark>' : this.name;
        this.type = this.isboi ? '' : asset['Type'];
        this.cost = this.isboi ? 'Special' : asset['Cost'];
        this.tl = this.isboi ? '-' : assets[this.name]['TL'];
        this.atk = this.isboi ? '-' : asset['Attack'].replace('None', '-');
        this.def = this.isboi ? '-' : asset['Counter'].replace('None', '-');
        this.stat = this.isboi ? '' : asset['W/C/F'];
        this.stat_tier = this.isboi ? '-' : assets[this.name]['STAT_TIER'];
        this.perm = this.isboi ? '' : assets[this.name]['PERM'] !== '' ? 'Needs governmental permission.' : '';
        this.special = this.isboi ? '' : assets[this.name]['SPECIAL'];
        this.range = this.isboi ? 0 : assets[this.name]['RANGE'];
        if (this.range === 0 && this.faction === 'The Deathless') {
            this.range = 1;
        }
        this.hex_id = hex_id;
        this.x = pos['asset']['X'];
        this.y = pos['asset']['Y'];
        this.size = box_size / 1.1;

        this.highlightHexes = function(hex_id, range) {
            let hex_list = hexes[hex_id][range];

            for (let j = 0; j < hex_list.length; j++) {
                let h = getElem(hex_list[j]);
                h.style.opacity = '0.05';
            }
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

        if (inactive_factions.includes(this.faction)) {
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
                getElem('tip_name').innerHTML = stealth_str;
                getElem('tip_hp').innerHTML = this.hp + '/' + this.max_hp;
                getElem('tip_cost').innerHTML = this.cost;
                getElem('tip_tl').innerHTML = this.tl;
                getElem('tip_atk').innerHTML = this.atk;
                getElem('tip_cnt').innerHTML = this.def;

                if (this.special !== '') {
                    getElem('tip_special').innerHTML = this.special;
                    getElem('tip_row_special').style.display = 'table-row';
                } else {
                    getElem('tip_row_special').style.display = 'none';
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

                for (let j = 0; j < hex_overlays.length; j++) {
                    hex_overlays[j].style.opacity = '0';
                }
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
        if (!show_inactive && inactive_factions.includes(this.faction)) {
            this.highlight_box.style.display = 'none';
            this.color_box.style.display = 'none';
            this.alpha_box.style.display = 'none';
            if (this.stealth_box) {
                this.stealth_box.style.display = 'none';
            }
            if (this.inactive_box) {
                this.inactive_box.style.display = 'none';
            }
        } else {
            this.highlight_box.update(new OpenSeadragon.Rect(highlight_x, highlight_y, box_size, box_size), null);
            this.color_box.setAttribute('x', asset_x);
            this.color_box.setAttribute('y', asset_y);
            this.color_box.style.display = 'block';
            this.alpha_box.setAttribute('x', asset_x);
            this.alpha_box.setAttribute('y', asset_y);
            this.alpha_box.style.display = 'block';
            if (this.stealth_box) {
                this.stealth_box.setAttribute('x', asset_x);
                this.stealth_box.setAttribute('y', asset_y);
                this.stealth_box.style.display = 'block';
            }
            if (this.inactive_box) {
                this.inactive_box.setAttribute('x', asset_x);
                this.inactive_box.setAttribute('y', asset_y);
                this.inactive_box.style.display = 'block';
            }
        }
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

function getElem(id) {
    return document.getElementById(id);
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

function replaceInactiveFactionNames(planet, fac, hw) {
    if (planet === 'The Guild Dyson Sphere') {
        getElem('planet_tip_fac').innerHTML = '🔥🔥🔥';
    } else if (inactive_factions.includes(fac) && !show_inactive) {
        getElem('planet_tip_fac').innerHTML = 'Unclaimed';
    } else {
        getElem('planet_tip_fac').innerHTML = fac + hw;
    }
}

function recolorPlanetNames() {
    let num_planets = planet_tracker.length;
    let planet_dict = {};

    for (let i = 0; i < num_planets; i++) {
        let id = 'planet_' + i.toString().padStart(2, '0');
        let name = getElem(id + '_name').innerHTML.toLowerCase();
        planet_dict[name] = id;
    }

    for (let i = 0; i < num_planets; i++) {
        let name = planet_tracker[i]['Name'].toLowerCase();
        let owner = planet_tracker[i]['Planetary Government'];
        let hw = planet_tracker[i]['Homeworld'];
        let id = planet_dict[name];
        let text = getElem(id + '_name');
        let box = getElem(id + '_color');
        if (owner === '' || (inactive_factions.includes(owner) && !show_inactive)) {
            text.setAttribute('fill', '#7c7c7c');
            text.setAttribute('font-weight', 'normal');
            box.setAttribute('fill', '#222222');
        } else {
            text.setAttribute('fill', factions[owner]['text']);
            if (owner === hw) {
                text.setAttribute('font-weight', 'bold');
            }
            box.setAttribute('fill', factions[owner]['color']);
        }
    }
}

function reorderAssets() {
    for (let i = 0; i < planet_tracker.length; i++) {
        let planet = planet_tracker[i];
        let local_assets = planet['Local Assets'];
        let hex_id = 'hex_' + planet['Hex'];
        let current_idx = planet['idx'];
        let num_planets = planet['total'];

        if (local_assets) {
            let local_counter = 0;

            for (let j = 0; j < local_assets.length; j++) {
                let id = local_assets[j];
                let asset_obj = asset_objects[id];
                let pos = getPosition(hex_id, current_idx, num_planets, local_counter);

                asset_obj.update(pos['asset']['X'], pos['asset']['Y'], pos['highlight']['X'], pos['highlight']['Y']);

                if (!show_inactive && inactive_factions.includes(asset_obj.faction)) {
                    continue;
                }

                local_counter++;
            }
        }
    }
    viewer.forceRedraw();
}

function toggleInactiveFactions() {
    show_inactive = !show_inactive;

    reorderAssets();
    sortTable();
    recolorPlanetNames();
}

function displayFactionAssets(faction) {
    if (faction === highlighted_fac) {
        displayAllAssets();
        highlighted_fac = '';
    } else {
        displayAllAssets();
        let fac = factions[faction]['short'].toLowerCase();
        let assets = document.getElementsByClassName('asset');
        let planets = document.getElementsByClassName('planet');

        for (let i = 0; i < assets.length; i++) {
            if (!assets[i].classList.contains(fac)) {
                assets[i].style.opacity = '0.05';
                assets[i].style.filter = 'grayscale(100%)';
                assets[i].style.WebkitFilter = 'grayscale(100%)';
            }
        }

        for (let i = 0; i < planets.length; i++) {
            planets[i].style.opacity = '0.05';
            planets[i].style.filter = 'grayscale(100%)';
            planets[i].style.WebkitFilter = 'grayscale(100%)';
        }
        highlighted_fac = faction;
    }
}

function displayAllAssets() {
    highlighted_fac = '';
    let assets = document.getElementsByClassName('asset');
    let planets = document.getElementsByClassName('planet');

    for (let i = 0; i < assets.length; i++) {
        assets[i].style.opacity = '1';
        assets[i].style.filter = 'none';
        assets[i].style.WebkitFilter = 'none';
    }

    for (let i = 0; i < planets.length; i++) {
        planets[i].style.opacity = '1';
        planets[i].style.filter = 'none';
        planets[i].style.WebkitFilter = 'none';
    }
}

function sortTable() {
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
                if (factions.hasOwnProperty(key)) {
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
        if (factions.hasOwnProperty(fac) && inactive_factions.includes(fac) && fac !== 'The Guild') {
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

function displayFactionInfo(faction) {
    let infl_sum = 0;
    for (let fac in faction_tracker) {
        if (faction_tracker.hasOwnProperty(fac) && (!inactive_factions.includes(fac) || show_inactive)) {
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
    getElem('info_goal').innerHTML = '<b>' + goal + '</b>';
    getElem('info_goaldesc').innerHTML = goal_desc;
    getElem('info_tag').innerHTML = '<b>' + faction_tracker[faction]['Tag'] + '</b>';
    getElem('info_tagdesc').innerHTML = tags[faction_tracker[faction]['Tag']];
    getElem('info_notes').innerHTML = faction_tracker[faction]['Notes'];
    getElem('info_infl_abs').innerHTML = faction_tracker[faction]['INFL'].replace(',', '.');
    getElem('info_infl_rel').innerHTML =
        Math.round(1000 * (parseFloat(faction_tracker[faction]['INFL']) / infl_sum)) / 10 + '%';

    getElem('info').style.opacity = '1';
    getElem('info').style.zIndex = '1';
}

function hideFactionInfo() {
    getElem('info').style.opacity = '0';
    getElem('info').style.zIndex = '-2';
}

function tsvJSON(tsv) {
    let lines = tsv.split('\n');
    let result = [];
    let headers = lines[0].split('\t');

    for (let i = 1; i < lines.length; i++) {
        let obj = {};
        let currentline = lines[i].split('\t');

        for (let j = 0; j < headers.length; j++) {
            obj[headers[j].replace('\r', '')] = currentline[j].replace('\r', '');
        }
        result.push(obj);
    }
    return result;
}

function processInfluenceTSV(tsv) {
    let lines = tsv.split('\n');
    let result = {};
    let facs = lines[1].split('\t');
    let n = facs.length;
    facs = facs.slice(5, n);

    for (let i = 2; i < lines.length - 1; i++) {
        let elems = lines[i].split('\t');
        let scores = lines[i].split('\t').slice(5, n);

        result[elems[2]] = {};
        result[elems[2]]['Hex'] = elems[0];
        result[elems[2]]['System'] = elems[1];
        result[elems[2]]['Score'] = elems[3];
        result[elems[2]]['Total Influence on Planet'] = elems[4];
        result[elems[2]]['Factions'] = {};

        for (let j = 0; j < facs.length; j++) {
            result[elems[2]]['Factions'][facs[j].trim()] = scores[j];
        }
    }
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

function updateChart(planet_name) {
    let planetary_influence = influence_tracker[planet_name]['Factions'];
    let labels = [];
    let values = [];
    let colors = [];
    let txt_colors = [];

    for (let fac in planetary_influence) {
        if (planetary_influence.hasOwnProperty(fac) && (!inactive_factions.includes(fac) || show_inactive)) {
            let fac_infl = parseFloat(planetary_influence[fac].replace(',', '.'));
            if (fac_infl > 0) {
                labels.push(fac);
                values.push(fac_infl);
                colors.push(factions[fac]['color']);
                txt_colors.push(factions[fac]['text']);
            }
        }
    }

    let list = [];
    for (let j = 0; j < labels.length; j++)
        list.push({
            label: labels[j],
            value: values[j],
            color: colors[j],
            txt_color: txt_colors[j]
        });

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
        values = [1];
        options = {
            labels: ['No influence'],
            colors: ['#ffffff']
        };
    }

    planet_tip_chart.updateSeries(values);
    planet_tip_chart.updateOptions(options);
    getElem('planet_tip_infl').innerHTML = influence_tracker[planet_name]['Total Influence on Planet'].replace(
        ',',
        '.'
    );
}

function updateChartOptions(opts) {
    planet_tip_chart.updateOptions(opts);
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
        .attr('xlink:href', 'img/hex.png')
        .attr('x', hex_x)
        .attr('y', hex_y)
        .attr('width', hex_w)
        .attr('height', hex_h);
}

function drawPlanetNames() {
    // TODO: make planet names into class

    let makeOverlay = function(i) {
        let planet = planet_tracker[i];
        let id = 'planet_' + i.toString().padStart(2, '0');
        let hex_id = 'hex_' + planet['Hex'];
        let system_name = planet['System'];
        let planet_name = planet['Name'];
        let pgov = planet['Planetary Government'];
        let hw = planet['Homeworld'];
        let tl = planet['TL'];
        let pop = planet['Population'];

        let hex_x = hexes[hex_id]['X'];
        let hex_y = hexes[hex_id]['Y'];
        let current_idx = planet['idx'];
        let num_planets = planet['total'];
        let x_offset = planet_to_hex_offsets[num_planets][current_idx]['X'];
        let y_offset = planet_to_hex_offsets[num_planets][current_idx]['Y'];

        let planet_color = '#7c7c7c';
        let box_color = '#222222';
        let font_weight = 'normal';
        let w_factor = 1;
        let hw_str = '';
        let owner_str = 'Unclaimed';
        if (pgov !== '') {
            planet_color = factions[pgov]['text'];
            box_color = factions[pgov]['color'];
            owner_str = pgov;
        }
        if (pgov === hw && pgov !== '') {
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
            .text(planet_name.toUpperCase())
            .attr('style', style_str)
            .attr('id', id + '_name')
            .attr('class', 'planet')
            .attr('font-family', 'D-DIN')
            .attr('font-weight', font_weight)
            .attr('fill', planet_color)
            .attr('text-anchor', 'middle')
            .attr('x', hex_x + x_offset)
            .attr('y', hex_y + y_offset + 0.011)
            .attr('pointer-events', 'none');
        let box_width = planet_name_SVG.node().getComputedTextLength();
        d3.select(svg_overlay.node())
            .insert('rect', '#' + id + '_name')
            .attr('id', id + '_color')
            .attr('class', 'planet')
            .attr('fill', box_color)
            .attr('x', hex_x + x_offset - (w_factor * box_width) / 2 - padding)
            .attr('y', hex_y + y_offset + 0.00812)
            .attr('width', (box_width + 2 * padding) * w_factor)
            .attr('height', 0.0034)
            .attr('pointer-events', 'none');

        let highlight = document.createElement('div');
        highlight.id = id + '_highlight';
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

        // noinspection JSUnusedLocalSymbols
        new OpenSeadragon.MouseTracker({
            element: id + '_highlight',
            enterHandler: () => {
                getElem('planet_tip_name').innerHTML = planet_name;
                getElem('planet_tip_sys').innerHTML = hex_id.replace('hex_', '') + ' / ' + system_name;
                getElem('planet_tip').style.display = 'block';
                getElem('planet_tip').style.zIndex = '3';
                planet_tip_on = true;
                if (planet_name === 'The Guild Dyson Sphere') {
                    tl = '9001';
                    pop = 'ok boomer';
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
                    updateChart(planet_name);
                    let opts = {
                        dataLabels: {
                            formatter: (val) => {
                                if (val > 5) {
                                    return Math.round(val * 10) / 10 + '%';
                                } else {
                                    return '';
                                }
                            }
                        }
                    };
                    updateChartOptions(opts);
                }
                getElem('planet_tip_tl').innerHTML = tl;
                getElem('planet_tip_pop').innerHTML = pop;
                replaceInactiveFactionNames(planet_name, owner_str, hw_str);
            },
            exitHandler: () => {
                getElem('planet_tip').style.display = 'none';
                planet_tip_on = false;
            },
            clickHandler: () => {
                window.open('https://far-verona.fandom.com/wiki/' + planet_name);
            }
        });
    };

    for (let i = 0; i < planet_tracker.length; i++) {
        makeOverlay(i);
    }

    recolorPlanetNames();
}

function drawAssets() {
    let counter = 0;

    for (let i = 0; i < planet_tracker.length; i++) {
        planet_tracker[i]['Local Assets'] = [];
        let planet = planet_tracker[i];
        let location = planet['Name Constructor'];
        let local_assets = asset_tracker.filter((asset) => asset['Location'] === location);
        let hex_id = 'hex_' + planet['Hex'];
        let idx = planet['idx'];
        let num_planets = planet['total'];

        // Assets
        if (local_assets.length > 0) {
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

            for (let j = 0; j < local_assets.length; j++) {
                let asset = local_assets[j];
                let pos = getPosition(hex_id, idx, num_planets, j);

                // Asset data
                let id = 'asset_' + counter.toString().padStart(3, '0');
                planet_tracker[i]['Local Assets'].push(id);
                counter += 1;
                asset_objects[id] = new Asset(id, asset, hex_id, pos);
            }
        }
    }

    reorderAssets();
    drawPlanetNames();
}

function drawPlanets() {
    // TODO: make Planet circles into class

    for (let i = 0; i < planet_tracker.length; i++) {
        planet_tracker[i]['Local Assets'] = [];
        let planet = planet_tracker[i];
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
        let system_id = planet['System'];
        let style_str;
        if (isFirefox) {
            style_str = 'font-size: 0.02px; font-size-adjust: 0.2';
        } else {
            style_str = 'font-size: 0.0056px';
        }
        let sys = getElem(system_id);
        if (!sys) {
            d3.select(svg_overlay.node())
                .insert('svg:text', 'circle')
                .text(system_id.toUpperCase())
                .attr('style', style_str)
                .attr('id', system_id)
                .attr('font-family', 'D-DIN')
                .attr('fill', '#7c7c7c')
                .attr('text-anchor', 'middle')
                .attr('x', hex_x)
                .attr('y', hex_y - 0.046)
                .attr('pointer-events', 'none');
        }
    }
}

function getFactions() {
    let url_faction_tracker =
        'https://docs.google.com/spreadsheets/d/e/2PACX-1vRCK-QRRccgk3_twQSIyfGU3qzuqyPB6WSb4_KktKyV6AzAmm7ioUBf-wddvLuaToxr5CVWy4tRiAS7/pub?gid=1760255261&single=true&output=tsv';
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            let json = tsvJSON(this.responseText);

            for (let i = 0; i < json.length; i++) {
                faction_tracker[json[i]['Faction']] = json[i];
            }
            sortTable();
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
            for (let hex in hexes) {
                let current_hex = hex;
                let num_planets = planet_tracker.filter((planet) => planet['Hex'] === current_hex.replace('hex_', ''))
                    .length;

                if (num_planets) {
                    let local_counter = 0;

                    for (let i = 0; i < planet_tracker.length; i++) {
                        if (planet_tracker[i]['Hex'] === current_hex.replace('hex_', '')) {
                            planet_tracker[i]['total'] = num_planets;
                            planet_tracker[i]['idx'] = local_counter;
                            local_counter++;
                        }
                    }
                }
            }
            drawPlanets();
            getAssets();
        }
    };
    xhttp_dyn_planets.open('GET', url_planet_tracker, true);
    xhttp_dyn_planets.send();
}

function getInfluence() {
    let url_influence_tracker =
        'https://docs.google.com/spreadsheets/d/e/2PACX-1vRCK-QRRccgk3_twQSIyfGU3qzuqyPB6WSb4_KktKyV6AzAmm7ioUBf-wddvLuaToxr5CVWy4tRiAS7/pub?gid=1919363050&single=true&output=tsv';
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            influence_tracker = processInfluenceTSV(this.responseText);
        }
    };

    xhttp.open('GET', url_influence_tracker, true);
    xhttp.send();
}

function onViewerOpen() {
    document.querySelector('#osd > div > div:nth-child(2) > div > div > div:nth-child(5)').style.display = 'none';
    let home = document.querySelector('#osd > div > div:nth-child(2) > div > div > div:nth-child(4)');
    let zoomout = document.querySelector('#osd > div > div:nth-child(2) > div > div > div:nth-child(3)');
    home.parentNode.insertBefore(home, zoomout);

    for (let key in hexes) {
        if (hexes.hasOwnProperty(key)) {
            makeHexOverlays(key);
        }
    }
    getInfluence();
    getPlanets();
    getFactions();
}
