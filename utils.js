function replaceInactiveFactionNames(planet, fac, hw) {
    planet_tip_fac = document.getElementById("planet_tip_fac");
    if (planet === "The Guild Dyson Sphere") {
        planet_tip_fac.innerHTML = "MY PRECIOUS";
    } else if (inactive_factions.includes(fac) && !show_inactive) {
        planet_tip_fac.innerHTML = "Unclaimed";
    } else {
        planet_tip_fac.innerHTML = fac + hw;
    }
}


function recolorPlanetNames() {

    let num_planets = planet_tracker.length;
    let planet_dict = {};

    for (let i=0;i<num_planets;i++) {
        let id = "planet_" + i.toString().padStart(2, '0');
        let name = document.getElementById(id + "_name").innerHTML.toLowerCase();
        planet_dict[name] = id;
    }

    for (let i=0;i<num_planets;i++) {
        let name = planet_tracker[i]["Name"].toLowerCase();
        let owner = planet_tracker[i]["Planetary Government"];
        let hw = planet_tracker[i]["Homeworld"];
        let id = planet_dict[name];
        let text = document.getElementById(id + "_name");
        let box = document.getElementById(id + "_color");
        if (owner === "" || (inactive_factions.includes(owner) && !show_inactive)) {
            text.setAttribute("fill", "#7c7c7c");
            text.setAttribute("font-weight", "normal");
            box.setAttribute("fill", "#222222");
        } else {
            text.setAttribute("fill", factions[owner]["text"]);
            if (owner === hw) {
                text.setAttribute("font-weight", "bold");
            }
            box.setAttribute("fill", factions[owner]["color"]);
        }
    }
}


function reorderAssets() {

    let inactive_shorts = [];

    for (let fac in factions) {
        if (factions.hasOwnProperty(fac) && inactive_factions.includes(fac)) {
            inactive_shorts.push(factions[fac]["short"].toLowerCase());
        }
    }

    let system_dict = {};

    for (let i=0;i<planet_tracker.length;i++) {
        let current_hex = "hex_" + planet_tracker[i]["Hex"];
        if (current_hex in system_dict) {
            system_dict[current_hex]["total"] += 1;
        } else {
            system_dict[current_hex] = {"total": 1, "current": 0};
        }
    }

    for (let i=0;i<planet_tracker.length;i++) {
        let local_assets = planet_tracker[i]["Local Assets"];
        let hex_id = "hex_" + planet_tracker[i]["Hex"];
        let current_idx = system_dict[hex_id]["current"];
        system_dict[hex_id]["current"] += 1;

        if (local_assets) {

            let local_counter = 0;

            for (let j=0;j<local_assets.length;j++) {
                let id = local_assets[j];
                let highlight = document.getElementById(id + "_highlight");
                let short = highlight.getAttribute("class").replace("highlight ", "");
                let color_box = document.getElementById(id + "_color");
                let alpha = document.getElementById(id + "_alpha");
                let stealth = document.getElementById(id + "_stealth");
                let inactive = document.getElementById(id + "_inactive");

                if (!show_inactive && inactive_shorts.includes(short)) {
                    highlight.style.display = "none";
                    color_box.style.display = "none";
                    alpha.style.display = "none";
                    if (stealth) {
                        stealth.style.display = "none";
                    }
                    if (inactive) {
                        inactive.style.display = "none";
                    }
                    continue
                }

                let hex_x = hexes[hex_id]["X"];
                let hex_y = hexes[hex_id]["Y"];
                let num_planets = system_dict[hex_id]["total"];
                let x_offset = planet_to_hex_offsets[num_planets][current_idx]["X"];
                let y_offset = planet_to_hex_offsets[num_planets][current_idx]["Y"];
                let xy_spiral = getSpiralOffset(local_counter);
                let highlight_x = hex_x + x_offset + xy_spiral[0] * box_size - 0.5 * box_size;
                let highlight_y = hex_y + y_offset + xy_spiral[1] * box_size - 0.5 * box_size;
                let asset_x = highlight_x + (box_size - (1/1.2) * box_size) / 2;
                let asset_y = highlight_y + (box_size - (1/1.2) * box_size) / 2;

                highlight.setAttribute("x", highlight_x);
                highlight.setAttribute("y", highlight_y);
                color_box.setAttribute("x", asset_x);
                color_box.setAttribute("y", asset_y);
                alpha.setAttribute("x", asset_x);
                alpha.setAttribute("y", asset_y);
                if (stealth) {
                    stealth.setAttribute("x", asset_x);
                    stealth.setAttribute("y", asset_y);
                }
                if (inactive) {
                    inactive.setAttribute("x", asset_x);
                    inactive.setAttribute("y", asset_y);
                }

                highlight.style.display = "block";
                color_box.style.display = "block";
                alpha.style.display = "block";
                if (stealth) {
                    stealth.style.display = "block";
                }
                if (inactive) {
                    inactive.style.display = "block";
                }

                local_counter++;
            }
        }
    }
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
        highlighted_fac = "";
    } else {
        displayAllAssets();
        let fac = factions[faction]["short"].toLowerCase();
        let assets = document.getElementsByClassName("asset");
        let planets = document.getElementsByClassName("planet");

        for (let i = 0; i < assets.length; i++) {
            if (!assets[i].classList.contains(fac)) {
                assets[i].style.opacity = "0.05";
                assets[i].style.filter = "grayscale(100%)";
                assets[i].style.WebkitFilter = "grayscale(100%)";
            }
        }

        for (let i = 0; i < planets.length; i++) {
            planets[i].style.opacity = "0.05";
            planets[i].style.filter = "grayscale(100%)";
            planets[i].style.WebkitFilter = "grayscale(100%)";
        }
        highlighted_fac = faction;
    }
}


function displayAllAssets() {
    highlighted_fac = "";
    let assets = document.getElementsByClassName("asset");
    let planets = document.getElementsByClassName("planet");

    for (let i=0; i<assets.length; i++) {
        assets[i].style.opacity = "1";
        assets[i].style.filter = "none";
        assets[i].style.WebkitFilter= "none";
    }

    for (let i=0; i<planets.length; i++) {
        planets[i].style.opacity = "1";
        planets[i].style.filter = "none";
        planets[i].style.WebkitFilter = "none";
    }
}


function sortTable() {
    let table, rows, switching, i, fac_a, fac_b, val_a, val_b, shouldSwitch;
    table = document.getElementById("factionTable");
    switching = true;

    while (switching) {
        switching = false;
        rows = table.rows;

        for (i=0; i<(rows.length - 1); i++) {
            shouldSwitch = false;
            fac_a = rows[i].getElementsByTagName("TD")[0].innerText.toLowerCase();
            fac_b = rows[i+1].getElementsByTagName("TD")[0].innerText.toLowerCase();

            for (let key in factions) {
                if (factions.hasOwnProperty(key)) {
                    if (factions[key]["short"].toLowerCase() === fac_a) {
                        val_a = parseFloat(faction_tracker[key]["INFL"]);
                    }
                    if (factions[key]["short"].toLowerCase() === fac_b) {
                        val_b = parseFloat(faction_tracker[key]["INFL"]);
                    }
                }
            }
            if (val_a < val_b) {
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i+1], rows[i]);
            switching = true;
        }
    }

    for (let fac in factions) {
        if (factions.hasOwnProperty(fac) && inactive_factions.includes(fac) && fac !== "The Guild") {
            let row = document.getElementById(factions[fac]["short"].toLowerCase() + "-row");

            if (show_inactive) {
                row.style.display = "table-row";
            } else {
                row.style.display = "none";
            }
        }
    }

    let scale = Math.min((viewport_h-50) / table.offsetHeight, 1);
    table.style.transform = "scale(" + scale + ")";
    if (scale < 1) {
        document.getElementsByClassName("factions")[0].style.right =  "-5px";
    } else {
        document.getElementsByClassName("factions")[0].style.right =  "10px";
    }

    $(".se-pre-con").fadeOut("slow");
}


function displayFactionInfo(faction) {

    let infl_sum = 0;
    for (let fac in faction_tracker) {
        if (faction_tracker.hasOwnProperty(fac) && (!inactive_factions.includes(fac) || show_inactive)) {
            infl_sum += parseFloat(faction_tracker[fac]["INFL"]);
        }
    }

    let goal = faction_tracker[faction]["Goal"];
    let goal_desc;
    if (goal === "") {
        goal = "(No goal)";
        goal_desc = "-";
    } else {
        goal_desc = goals[goal];
    }

    document.getElementById("info_faction").innerHTML = faction_tracker[faction]["Faction"];
    document.getElementById("info_homeworld").innerHTML = faction_tracker[faction]["Homeworld"];
    document.getElementById("info_force").innerHTML = "<b>" + faction_tracker[faction]["F"] + "</b>";
    document.getElementById("info_cunning").innerHTML = "<b>" + faction_tracker[faction]["C"] + "</b>";
    document.getElementById("info_wealth").innerHTML = "<b>" + faction_tracker[faction]["W"] + "</b>";
    document.getElementById("info_hp").innerHTML = "<b>" + faction_tracker[faction]["HP"] + "/" + faction_tracker[faction]["Max HP"] + "</b>";
    document.getElementById("info_income").innerHTML = "<b>" + faction_tracker[faction]["Income"] + "</b>";
    document.getElementById("info_balance").innerHTML = "<b>" + faction_tracker[faction]["Balance"] + "</b>";
    document.getElementById("info_exp").innerHTML = "<b>" + faction_tracker[faction]["EXP"] + "</b>";
    document.getElementById("info_goal").innerHTML = "<b>" + goal + "</b>";
    document.getElementById("info_goaldesc").innerHTML = goal_desc;
    document.getElementById("info_tag").innerHTML = "<b>" + faction_tracker[faction]["Tag"] + "</b>";
    document.getElementById("info_tagdesc").innerHTML = tags[faction_tracker[faction]["Tag"]];
    document.getElementById("info_notes").innerHTML = faction_tracker[faction]["Notes"];
    document.getElementById("info_infl_abs").innerHTML = faction_tracker[faction]["INFL"].replace(",",".");
    document.getElementById("info_infl_rel").innerHTML = Math.round(1000 * (parseFloat(faction_tracker[faction]["INFL"]) / infl_sum)) / 10 + "%";

    document.getElementById("info").style.opacity = '1';
    document.getElementById("info").style.zIndex = '1';
}


function hideFactionInfo() {
    document.getElementById("info").style.opacity = '0';
    document.getElementById("info").style.zIndex = '-2';
}


function tsvJSON(tsv) {
    let lines = tsv.split("\n");
    let result = [];
    let headers = lines[0].split("\t");

    for (let i=1;i<lines.length;i++) {
        let obj = {};
        let currentline = lines[i].split("\t");

        for (let j=0;j<headers.length;j++) {
            obj[headers[j].replace("\r", "")] = currentline[j].replace("\r", "");
        }
        result.push(obj)
    }
    return result
}


function processInfluenceTSV(tsv) {
    let lines = tsv.split("\n");
    let result = {};
    let facs = lines[1].split("\t");
    let n = facs.length;
    facs = facs.slice(5, n);

    for (let i=2;i<lines.length-1;i++) {

        let elems = lines[i].split("\t");
        let scores = lines[i].split("\t").slice(5, n);

        result[elems[2]] = {};
        result[elems[2]]["Hex"] = elems[0];
        result[elems[2]]["System"] = elems[1];
        result[elems[2]]["Score"] = elems[3];
        result[elems[2]]["Total Influence on Planet"] = elems[4];
        result[elems[2]]["Factions"] = {};

        for (let j=0;j<facs.length;j++) {
            result[elems[2]]["Factions"][facs[j].trim()] = scores[j];
        }
    }
    return result
}


function first(i) {
    return (2 * i - 1) * (2 * i - 1)
}


function isqrt(i) {
    if (Math.floor(i) === 0) {
        return 0
    } else {
        return Math.floor(Math.sqrt(i))
    }
}


function cycle(i) {
    return Math.floor((isqrt(i) + 1) / 2);
}


function len(i) {
    return 8 * i
}


function sector(i) {
    let c = cycle(i);
    let offset = i - first(c);
    let n = len(c);
    return Math.floor(4 * offset / n)
}


function getSpiralOffset(i) {
    let x = -0.5;
    let y = -0.5;

    if (i !== 0) {
        let c = cycle(i);
        let s = sector(i);
        let offset = i - first(c) - Math.floor(s * len(c) / 4);
        if (s === 1) {
            x = -c + offset + 1;
            y = -c;
        } else if (s === 2) {
            x = c;
            y = -c + offset + 1;
        } else if (s === 3) {
            x = c - offset -1;
            y = c;
        } else {
            x = -c;
            y = c - offset - 1;
        }
        x = -x - 0.5;
        y = -y - 0.5;
    }
    return [x, y]
}


function updateChart(planet_name) {

    let planetary_influence = influence_tracker[planet_name]["Factions"];
    let labels = [];
    let values = [];
    let colors = [];
    let txt_colors = [];

    for (let fac in planetary_influence) {
        if (planetary_influence.hasOwnProperty(fac) && (!inactive_factions.includes(fac) || show_inactive)) {
            let fac_infl = parseFloat(planetary_influence[fac].replace(",","."));
            if (fac_infl > 0) {
                labels.push(fac);
                values.push(fac_infl);
                colors.push(factions[fac]["color"]);
                txt_colors.push(factions[fac]["text"]);
            }
        }
    }

    let list = [];
    for (let j = 0; j < labels.length; j++)
        list.push({'label': labels[j], 'value': values[j], 'color': colors[j], 'txt_color': txt_colors[j]});

    list.sort(function(a, b) {
        return ((a.value < b.value) ? 1 : ((a.value === b.value) ? 0 : -1));
    });

    let sum = 0;

    for (let k = 0; k < list.length; k++) {
        sum += list[k].value;
        labels[k] = list[k].label + " (" + list[k].value + ")";
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
            labels: ["No influence"],
            colors: ["#ffffff"]
        }
    }

    planet_tip_chart.updateSeries(values);
    planet_tip_chart.updateOptions(options);
    let planet_tip_infl = document.getElementById("planet_tip_infl");
    planet_tip_infl.innerHTML = influence_tracker[planet_name]["Total Influence on Planet"].replace(",",".");
}


function updateChartOptions(opts) {
    planet_tip_chart.updateOptions(opts);
}


function makeHexOverlays(key) {

    const size = 0.0635;
    const hex_w = 2 * size;
    const hex_h = Math.sqrt(3) * size;
    const hex_x = hexes[key]["X"] - hex_w/2;
    const hex_y = hexes[key]["Y"] - hex_h/2;

    d3.select(svg_overlay.node()).append("svg:image")
        .attr("id", key)
        .attr("class", "hex")
        .attr("xlink:href", "hex.png")
        .attr("x", hex_x)
        .attr("y", hex_y)
        .attr("width", hex_w)
        .attr("height", hex_h);
}


function drawPlanetNames() {
    let system_dict = {};
    for (let i=0;i<planet_tracker.length;i++) {
        let current_hex = "hex_" + planet_tracker[i]["Hex"];
        if (current_hex in system_dict) {
            system_dict[current_hex]["total"] += 1;
        } else {
            system_dict[current_hex] = {"total": 1, "current": 0};
        }
    }

    let makeOverlay = function(i) {
        let planet = planet_tracker[i];
        let id = "planet_" + i.toString().padStart(2, "0");
        let hex_id = "hex_" + planet["Hex"];
        let system_name = planet["System"];
        let planet_name = planet["Name"];
        let full_name = planet["Name Constructor"];
        let pgov = planet["Planetary Government"];
        let hw = planet["Homeworld"];
        let tl = planet["TL"];
        let pop = planet["Population"];

        let hex_x = hexes[hex_id]["X"];
        let hex_y = hexes[hex_id]["Y"];
        let num_planets = system_dict[hex_id]["total"];
        let current_idx = system_dict[hex_id]["current"];
        system_dict[hex_id]["current"] += 1;
        let x_offset = planet_to_hex_offsets[num_planets][current_idx]["X"];
        let y_offset = planet_to_hex_offsets[num_planets][current_idx]["Y"];

        let planet_color = "#7c7c7c";
        let box_color = "#222222";
        let font_weight = "normal";
        let w_factor = 1;
        let hw_str = "";
        let owner_str = "Unclaimed";
        if (pgov !== "") {
            planet_color = factions[pgov]["text"];
            box_color = factions[pgov]["color"];
            owner_str = pgov;
        }
        if (pgov === hw && pgov !== "") {
            font_weight = "bold";
            w_factor = 0.98;
            hw_str = " (Homeworld)";
        }
        let padding;
        let style_str;
        if (isFirefox) {
            style_str = "font-size: 0.01px; font-size-adjust: 0.1";
            padding = 0.0015;
        } else {
            style_str = "font-size: 0.0032px";
            padding = 0.0005;
        }

        let planet_name_SVG = d3.select(svg_overlay.node()).append("svg:text")
            .text(planet_name.toUpperCase())
            .attr("style", style_str)
            .attr("id", id + "_name")
            .attr("class", "planet")
            .attr("font-family", "D-DIN")
            .attr("font-weight", font_weight)
            .attr("fill", planet_color)
            .attr("text-anchor", "middle")
            .attr("x", hex_x + x_offset)
            .attr("y", hex_y + y_offset + 0.01055)
            .attr("pointer-events", "none");
        let box_width = planet_name_SVG.node().getComputedTextLength();
        d3.select(svg_overlay.node()).insert("rect", ".planet")
            .attr("id", id + "_color")
            .attr("class", "planet")
            .attr("fill", box_color)
            .attr("x", hex_x + x_offset - w_factor*box_width/2 - padding)
            .attr("y", hex_y + y_offset + 0.00772)
            .attr("width", (box_width + 2 * padding) * w_factor)
            .attr("height", 0.0034)
            .attr("pointer-events", "none");

        d3.select(svg_overlay.node()).append("rect")
            .attr("id", id)
            .attr("class", "highlight")
            .attr("fill", "#ffffff")
            .attr("x", hex_x + x_offset - w_factor*box_width/2 - padding)
            .attr("y", hex_y + y_offset + 0.00772)
            .attr("width", (box_width + 2 * padding) * w_factor)
            .attr("height", 0.0034)
            .style("cursor", "pointer");

        // noinspection JSUnusedLocalSymbols
        const mouse_tracker = new OpenSeadragon.MouseTracker({
            element: id,
            enterHandler: () => {
                const planet_tip = document.getElementById("planet_tip");
                const planet_tip_name = document.getElementById("planet_tip_name");
                const planet_tip_sys = document.getElementById("planet_tip_sys");
                const planet_tip_tl = document.getElementById("planet_tip_tl");
                const planet_tip_pop = document.getElementById("planet_tip_pop");
                const planet_tip_infl = document.getElementById("planet_tip_infl");

                planet_tip_name.innerHTML = planet_name;
                planet_tip_sys.innerHTML = hex_id.replace("hex_", "") + " / " + system_name;
                planet_tip_tl.innerHTML = tl;
                planet_tip_pop.innerHTML = pop;
                planet_tip.style.display = "block";
                planet_tip.style.zIndex = "3";
                planet_tip_on = true;
                if (planet_name === 'The Guild Dyson Sphere') {
                    let options = {
                        labels: ["The Guild"],
                        colors: ["#f70094"],
                        dataLabels: {
                            formatter: () => {
                                return "420.0%"
                            },
                            style: {
                                colors: ["#ffffff"]
                            }
                        }
                    };
                    planet_tip_chart.updateSeries([6969]);
                    planet_tip_chart.updateOptions(options);
                    planet_tip_infl.innerHTML = "6969";
                } else {
                    updateChart(planet_name);
                    let opts = {
                        dataLabels: {
                            formatter: (val) => {
                                if (val > 5) {
                                    return Math.round(val * 10) / 10 + "%"
                                } else {
                                    return ""
                                }
                            }
                        }
                    };
                    updateChartOptions(opts);
                }
                replaceInactiveFactionNames(planet_name, owner_str, hw_str)
            },
            exitHandler: () => {
                const planet_tip = document.getElementById("planet_tip");
                planet_tip.style.display = "none";
                planet_tip_on = false;
            },
            clickHandler: () => {
                window.open("https://far-verona.fandom.com/wiki/" + planet_name);
            }
        });
    };

    for (let i=0; i<planet_tracker.length; i++) {
        makeOverlay(i);
    }

    recolorPlanetNames();
}


function drawAssets() {

    let highlightHexes = function(hex, range) {
        let hex_list = hexes[hex][range];

        for (let j=0; j<hex_list.length; j++) {
            h = document.getElementById(hex_list[j]);
            h.style.opacity = "0.05";
        }
    };

    let system_dict = {};

    for (let i=0;i<planet_tracker.length;i++) {
        let current_hex = "hex_" + planet_tracker[i]["Hex"];
        if (current_hex in system_dict) {
            system_dict[current_hex]["total"] += 1;
        } else {
            system_dict[current_hex] = {"total": 1, "current": 0};
        }
    }

    let counter = 0;
    let asset_size = box_size/1.2;

    for (let i=0;i<planet_tracker.length;i++) {
        planet_tracker[i]["Local Assets"] = [];
        let location = planet_tracker[i]["Name Constructor"];
        let local_assets = asset_tracker.filter(asset => asset["Location"] === location);
        let hex_id = "hex_" + planet_tracker[i]["Hex"];
        let current_idx = system_dict[hex_id]["current"];
        system_dict[hex_id]["current"] += 1;
        let hex_x = hexes[hex_id]["X"];
        let hex_y = hexes[hex_id]["Y"];
        let num_planets = system_dict[hex_id]["total"];
        let x_offset = planet_to_hex_offsets[num_planets][current_idx]["X"];
        let y_offset = planet_to_hex_offsets[num_planets][current_idx]["Y"];

        // Planet Circle
        let circle_id = planet_tracker[i]["Name"] + "_circle";
        let planet_circle = document.getElementById(circle_id);
        if (!planet_circle) {
            let circle_color = "#404040";
            if (hex_id === "hex_0808") {
                circle_color = factions["The Guild"]["color"];
            }

            d3.select(svg_overlay.node()).insert("circle", ".hex")
                .attr("id", circle_id)
                .attr("fill", "#222222")
                .attr("stroke", circle_color)
                .style("stroke-width", 0.0005)
                .attr("cx", hex_x + x_offset)
                .attr("cy", hex_y + y_offset)
                .attr("r", 0.0105);
        }

        // System Name
        let system_id = planet_tracker[i]["System"];
        let style_str;
        if (isFirefox) {
            style_str = "font-size: 0.02px; font-size-adjust: 0.2";
        } else {
            style_str = "font-size: 0.0056px";
        }
        let sys = document.getElementById(system_id);
        if (!sys) {
            d3.select(svg_overlay.node()).insert("svg:text", "circle")
                .text(system_id.toUpperCase())
                .attr("style", style_str)
                .attr("id", system_id)
                .attr("font-family", "D-DIN")
                .attr("fill", "#7c7c7c")
                .attr("text-anchor", "middle")
                .attr("x", hex_x)
                .attr("y", hex_y - 0.046)
                .attr("pointer-events", "none");
        }

        if (local_assets.length > 0) {
            local_assets.sort(
                (a, b) =>
                    (a["Owner"] > b["Owner"]) ? 1 :
                        (a["Owner"] === b["Owner"]) ? ((a["Asset"] > b["Asset"]) ? 1 :
                            (a["Asset"] === b["Asset"]) ? ((a["HP"] > b["HP"]) ? 1 : -1)
                                : -1)
                            : -1
            );

            let local_counter = 0;

            for (let j=0;j<local_assets.length;j++) {

                let asset = local_assets[j];

                // Positioning data
                let xy_spiral = getSpiralOffset(local_counter);
                let highlight_x = hex_x + x_offset + xy_spiral[0] * box_size - 0.5 * box_size;
                let highlight_y = hex_y + y_offset + xy_spiral[1] * box_size - 0.5 * box_size;
                let asset_x = highlight_x + (box_size - (1/1.2) * box_size) / 2;
                let asset_y = highlight_y + (box_size - (1/1.2) * box_size) / 2;

                // Asset data
                let id = "asset_" + counter.toString().padStart(3, '0');
                planet_tracker[i]["Local Assets"].push(id);
                counter += 1;
                let name = asset["Asset"];
                let faction = asset["Owner"];
                let hp = asset["HP"];
                let max_hp = asset["Max HP"];
                let stealth = asset["ʘ"];
                let stealth_str = "";
                if (stealth !== "FALSE") {
                    stealth_str = " (Stealthed)";
                }
                let type = asset["Type"];

                let cost;
                let tl;
                let atk;
                let def;
                let stat;
                let stattier;
                let perm;
                let special;
                let range;

                if (name !== "Base Of Influence") {
                    cost = asset["Cost"];
                    tl = assets[name]["TL"];
                    atk = asset["Attack"].replace("None", "-");
                    def = asset["Counter"].replace("None", "-");
                    stat = asset["W/C/F"];
                    stattier = assets[name]["STAT_TIER"];
                    perm = assets[name]["PERM"];
                    if (perm !== "") {
                        perm = "Needs governmental permission."
                    }
                    special = assets[name]["SPECIAL"];
                    range = assets[name]["RANGE"];
                    if (range === 0 && faction === "The Deathless") {
                        range = 1;
                    }
                }

                // Image Overlay
                d3.select(svg_overlay.node()).append("rect")
                    .attr("id", id + "_color")
                    .attr("class", "asset " + factions[faction]["short"].toLowerCase())
                    .attr("fill", factions[faction]["color"])
                    .attr("x", asset_x)
                    .attr("y", asset_y)
                    .attr("width", asset_size)
                    .attr("height", asset_size);

                d3.select(svg_overlay.node()).append("svg:image")
                    .attr("id", id + "_alpha")
                    .attr("class", "asset " + factions[faction]["short"].toLowerCase())
                    .attr("xlink:href", "assets_alpha/" + name + ".png")
                    .attr("x", asset_x)
                    .attr("y", asset_y)
                    .attr("width", asset_size)
                    .attr("height", asset_size);

                if (stealth !== "FALSE") {
                    d3.select(svg_overlay.node()).append("svg:image")
                        .attr("id", id + "_stealth")
                        .attr("class", "asset " + factions[faction]["short"].toLowerCase())
                        .attr("xlink:href", "assets_alpha/Stealth.png")
                        .attr("x", asset_x)
                        .attr("y", asset_y)
                        .attr("width", asset_size)
                        .attr("height", asset_size);
                }

                if (inactive_factions.includes(faction)) {
                    d3.select(svg_overlay.node()).append("svg:image")
                        .attr("id", id + "_inactive")
                        .attr("class", "asset " + factions[faction]["short"].toLowerCase())
                        .attr("xlink:href", "assets_alpha/Inactive.png")
                        .attr("x", asset_x)
                        .attr("y", asset_y)
                        .attr("width", asset_size)
                        .attr("height", asset_size);
                }

                // Highlight Overlay
                // d3.select(svg_overlay.node()).append("rect")
                //     .attr("id", id + "_highlight")
                //     .attr("class", "highlight " + factions[faction]["short"].toLowerCase())
                //     .attr("fill", "#fff")
                //     .attr("x", highlight_x)
                //     .attr("y", highlight_y)
                //     .attr("width", box_size)
                //     .attr("height", box_size);

                const tip = document.getElementById("tip");
                const tip_fac = document.getElementById("tip_fac");
                const tip_stats = document.getElementById("tip_stats");
                const tip_name = document.getElementById("tip_name");
                const tip_hp = document.getElementById("tip_hp");
                const tip_cost = document.getElementById("tip_cost");
                const tip_tl = document.getElementById("tip_tl");
                const tip_atk = document.getElementById("tip_atk");
                const tip_cnt = document.getElementById("tip_cnt");
                const tip_special = document.getElementById("tip_special");
                const tip_perm = document.getElementById("tip_perm");
                const tip_row_special = document.getElementById("tip_row_special");
                const tip_row_perm = document.getElementById("tip_row_perm");
                const hex_overlays = document.getElementsByClassName("hex");

                // const mouse_tracker = new OpenSeadragon.MouseTracker({
                //     element: id + "_highlight",
                //     enterHandler: () => {
                //         if (name !== "Base Of Influence") {
                //             tip_fac.innerHTML = faction;
                //             tip_stats.innerHTML = type + ", " + stat + " " + stattier;
                //             tip_name.innerHTML = name + stealth_str;
                //             tip_hp.innerHTML = hp + "/" + max_hp;
                //             tip_cost.innerHTML = cost;
                //             tip_tl.innerHTML = tl;
                //             tip_atk.innerHTML = atk.replace("None", "-");
                //             tip_cnt.innerHTML = def.replace("None", "-");
                //             tip_special.innerHTML = special;
                //             tip_perm.innerHTML = "<i>" + perm + "</i>";
                //
                //             if (special !== "") {
                //                 tip_row_special.style.display = "table-row";
                //             }
                //             else {
                //                 tip_row_special.style.display = "none";
                //             }
                //             if (perm !== "") {
                //                 tip_row_perm.style.display = "table-row";
                //             } else {
                //                 tip_row_perm.style.display = "none";
                //             }
                //         } else {
                //             tip_fac.innerHTML = faction;
                //             tip_stats.innerHTML = "";
                //             tip_name.innerHTML = name + stealth_str;
                //             tip_hp.innerHTML = hp + "/" + max_hp;
                //             tip_cost.innerHTML = "Special";
                //             tip_tl.innerHTML = "-";
                //             tip_atk.innerHTML = "-";
                //             tip_cnt.innerHTML = "-";
                //             tip_special.innerHTML = "";
                //             tip_perm.innerHTML = "";
                //
                //             tip_row_special.style.display = "none";
                //             tip_row_perm.style.display = "none";
                //         }
                //
                //         tip.style.display = "block";
                //         tip_on = true;
                //
                //         if (range > 0) {
                //             highlightHexes(hex_id, range);
                //         }
                //     },
                //     exitHandler: () => {
                //         tip.style.display = "none";
                //         tip_fac.innerHTML = "";
                //         tip_stats.innerHTML = "";
                //         tip_name.innerHTML = "";
                //         tip_hp.innerHTML = "";
                //         tip_cost.innerHTML = "";
                //         tip_tl.innerHTML = "";
                //         tip_atk.innerHTML = "";
                //         tip_cnt.innerHTML = "";
                //         tip_special.innerHTML = "";
                //         tip_perm.innerHTML = "";
                //         tip_on = false;
                //
                //         for (let j=0; j<hex_overlays.length; j++) {
                //             hex_overlays[j].style.opacity = "0";
                //         }
                //     },
                //     clickHandler: () => {
                //         if (tip_on) {
                //             tip_on = false;
                //             $("#tip").fadeOut(200);
                //         } else {
                //             tip_on = true;
                //             $("#tip").fadeIn(200);
                //         }
                //     }
                // });

                local_counter += 1;
            }
        }
    }

    reorderAssets();
}


function getFactions() {
    let url_faction_tracker = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRCK-QRRccgk3_twQSIyfGU3qzuqyPB6WSb4_KktKyV6AzAmm7ioUBf-wddvLuaToxr5CVWy4tRiAS7/pub?gid=1760255261&single=true&output=tsv";
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            let json = tsvJSON(this.responseText);

            for (let i=0;i<json.length;i++) {
                faction_tracker[json[i]["Faction"]] = json[i];
            }

            sortTable();
        }
    };

    xhttp.open("GET", url_faction_tracker, true);
    xhttp.send();
}


function getAssets() {
    const url_asset_tracker = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRCK-QRRccgk3_twQSIyfGU3qzuqyPB6WSb4_KktKyV6AzAmm7ioUBf-wddvLuaToxr5CVWy4tRiAS7/pub?gid=2128046628&single=true&output=tsv";
    const xhttp_dyn_assets = new XMLHttpRequest();
    xhttp_dyn_assets.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            asset_tracker = tsvJSON(this.responseText);
            drawAssets();
            drawPlanetNames();
        }
    };
    xhttp_dyn_assets.open("GET", url_asset_tracker, true);
    xhttp_dyn_assets.send();
}


function getPlanets() {
    const url_planet_tracker = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRCK-QRRccgk3_twQSIyfGU3qzuqyPB6WSb4_KktKyV6AzAmm7ioUBf-wddvLuaToxr5CVWy4tRiAS7/pub?gid=464173844&single=true&output=tsv";
    const xhttp_dyn_planets = new XMLHttpRequest();
    xhttp_dyn_planets.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            planet_tracker = tsvJSON(this.responseText);
            getAssets();
        }
    };
    xhttp_dyn_planets.open("GET", url_planet_tracker, true);
    xhttp_dyn_planets.send();
}


function getInfluence() {
    let url_influence_tracker = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRCK-QRRccgk3_twQSIyfGU3qzuqyPB6WSb4_KktKyV6AzAmm7ioUBf-wddvLuaToxr5CVWy4tRiAS7/pub?gid=1919363050&single=true&output=tsv";
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            influence_tracker = processInfluenceTSV(this.responseText);
        }
    };

    xhttp.open("GET", url_influence_tracker, true);
    xhttp.send();
}


function onViewerOpen() {
    $(window).resize(() => {
        svg_overlay.resize();
    });

    for (let key in hexes) {
        if (hexes.hasOwnProperty(key)) {
            makeHexOverlays(key);
        }
    }
    getInfluence();
    getPlanets();
    getFactions();
}