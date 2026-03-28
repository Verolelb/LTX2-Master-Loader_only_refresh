import { app } from "../../../scripts/app.js";
import { api } from "../../../scripts/api.js";

app.registerExtension({
    name: "LoRaDaddy.LTX2Dashboard",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "LTX2MasterLoaderLD") {
            
            nodeType.prototype.onNodeCreated = function () {
                this.size = [800, 500]; // Augmenté un peu pour le bouton
                this.properties = this.properties || {};
                if (!this.properties.stack_data) {
                    let initial = [];
                    for(let i=0; i<10; i++) initial.push({ on: true, lora: "None", guard: false, strength: 1.0 });
                    this.properties.stack_data = JSON.stringify(initial);
                }

                const w = this.addWidget("text", "stack_data", this.properties.stack_data, (v) => {});
                w.draw = () => {}; 
                w.computeSize = () => [0, -4];
                this.widgets = [w]; 
            };

            const syncToBackend = (node) => {
                const widget = node.widgets.find(w => w.name === "stack_data");
                if (widget) widget.value = node.properties.stack_data;
            };

            nodeType.prototype.onMouseDown = function(e, local_pos) {
                if (this.flags.collapsed) return;
                const [x, y] = local_pos;
                const width = this.size[0];
                const height = this.size[1];

                // --- LOGIQUE DU BOUTON REFRESH ---
                // Zone du bouton : En haut, à droite par exemple
                if (y > 10 && y < 40 && x > width - 160 && x < width - 10) {
                    this.refreshLoras();
                    return true;
                }

                const data = JSON.parse(this.properties.stack_data);
                const rowHeight = (height - 80) / 10; // Ajusté pour le décalage du bouton

                for (let i = 0; i < 10; i++) {
                    const rowY = 70 + (i * rowHeight); // Décalé vers le bas
                    if (y > rowY - 15 && y < rowY + 15) {
                        if (x > 85 && x < width - 280) {
                            // On récupère la liste depuis nodeData qui est mis à jour
                            const loraList = nodeData.input.hidden.available_loras[0];
                            const menu = new LiteGraph.ContextMenu(loraList, {
                                event: e, scale: 1.2,
                                callback: (v) => {
                                    data[i].lora = v;
                                    this.properties.stack_data = JSON.stringify(data);
                                    syncToBackend(this);
                                    this.setDirtyCanvas(true);
                                }
                            });
                            // ... (votre logique de recherche reste identique) ...
                            const searchWrapper = document.createElement("div");
                            searchWrapper.style = "padding: 5px; background: #333; border-bottom: 1px solid #555;";
                            const input = document.createElement("input");
                            input.style = "width: 100%; background: #222; color: #00FFCC; border: 1px solid #444; padding: 4px;";
                            input.placeholder = "Search LoRAs...";
                            searchWrapper.appendChild(input);
                            menu.root.prepend(searchWrapper);
                            setTimeout(() => input.focus(), 10);
                            input.addEventListener("input", (ev) => {
                                const term = ev.target.value.toLowerCase();
                                menu.root.querySelectorAll(".litemenu-entry").forEach(item => {
                                    item.style.display = item.textContent.toLowerCase().includes(term) ? "block" : "none";
                                });
                            });
                            return true; 
                        }
                        else if (x > 10 && x < 75) { data[i].on = !data[i].on; }
                        else if (x > width - 250 && x < width - 180) { data[i].guard = !data[i].guard; }
                        else if (x > width - 160) {
                            if (x < width - 130) data[i].strength = Math.round((data[i].strength - 0.05) * 100) / 100;
                            else if (x > width - 40) data[i].strength = Math.round((data[i].strength + 0.05) * 100) / 100;
                            else {
                                const val = prompt("Strength:", data[i].strength);
                                if (val !== null) data[i].strength = parseFloat(val) || 0;
                            }
                        }
                        this.properties.stack_data = JSON.stringify(data);
                        syncToBackend(this);
                        this.setDirtyCanvas(true);
                        return true;
                    }
                }
            };

            // Fonction pour forcer le rafraîchissement
            nodeType.prototype.refreshLoras = async function() {
                console.log("Refreshing LoRAs...");
                // On demande au serveur de rescanner les dossiers
                await api.fetchApi("/object_info", { method: "GET" }); 
                // Dans ComfyUI, modifier nodeData.input.hidden met à jour les références pour les prochains clics
                const response = await fetch('/object_info');
                const info = await response.json();
                if (info[nodeData.name]) {
                    nodeData.input.hidden.available_loras = info[nodeData.name].input.hidden.available_loras;
                    alert("LoRa List Updated!");
                }
            };

            nodeType.prototype.onDrawForeground = function(ctx) {
                if (this.flags.collapsed) return;
                const data = JSON.parse(this.properties.stack_data);
                const width = this.size[0];
                const height = this.size[1];
                
                // Dessin du bouton Refresh
                ctx.fillStyle = "#333";
                ctx.fillRect(width - 160, 10, 150, 30);
                ctx.fillStyle = "#EEE";
                ctx.font = "12px Arial";
                ctx.textAlign = "center";
                ctx.fillText("🔄 REFRESH LORAS", width - 85, 30);
                ctx.textAlign = "left";

                const rowHeight = (height - 80) / 10;
                syncToBackend(this);

                ctx.font = "bold 13px Arial";
                for (let i = 0; i < 10; i++) {
                    const y = 70 + (i * rowHeight);
                    const row = data[i];
                    ctx.fillStyle = i % 2 === 0 ? "#1a1a1a" : "#222222";
                    ctx.fillRect(5, y-rowHeight/2, width-10, rowHeight-2);
                    
                    ctx.fillStyle = row.on ? "#4CAF50" : "#f44336";
                    ctx.fillText(row.on ? "✔ ON" : "✖ OFF", 15, y+5);
                    
                    ctx.fillStyle = row.lora === "None" ? "#555" : "#DDD";
                    ctx.fillText(row.lora.split(/[\\/]/).pop().substring(0, 40), 90, y+5);
                    
                    ctx.fillStyle = row.guard ? "#2196F3" : "#555";
                    ctx.fillText(row.guard ? "🔊" : "🔇", width - 225, y+5);
                    
                    ctx.fillStyle = "#666"; ctx.fillText("<", width - 150, y+5);
                    ctx.fillStyle = "#00FFCC"; ctx.textAlign = "center";
                    ctx.fillText(row.strength.toFixed(2), width - 85, y+5);
                    ctx.textAlign = "left"; ctx.fillStyle = "#666"; ctx.fillText(">", width - 30, y+5);
                }
            };
        }
    }
});