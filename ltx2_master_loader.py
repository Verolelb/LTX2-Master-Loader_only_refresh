import torch, folder_paths, comfy.utils, comfy.sd, json

class LTX2MasterLoaderLD:
    @classmethod
    def INPUT_TYPES(s):
        lora_list = ["None"] + folder_paths.get_filename_list("loras")
        return {
            "required": {
                "model": ("MODEL",),
                "clip": ("CLIP",),
                "stack_data": ("STRING", {"default": "[]", "multiline": False}),
            },
            "hidden": {"available_loras": (lora_list,)}
        }

    RETURN_TYPES = ("MODEL", "CLIP")
    FUNCTION = "apply_stack"
    CATEGORY = "LTX2/LoRa-Daddy"

    def apply_stack(self, model, clip, stack_data, available_loras=None):
        m, c = model, clip
        try:
            data = json.loads(stack_data)
        except: return (m, c)

        audio_keywords = ["audio", "vocoder", "speech", "audio_stream", "cross_modal"]

        for row in data:
            if row.get("on") and row.get("lora") != "None":
                path = folder_paths.get_full_path("loras", row["lora"])
                if not path: continue
                weights = comfy.utils.load_torch_file(path, safe_load=True)
                
                # UPDATED LOGIC: If guard is False (Muted), we strip audio weights
                if not row.get("guard"):
                    weights = {k: v for k, v in weights.items() if not any(kw in k.lower() for kw in audio_keywords)}
                
                m, c = comfy.sd.load_lora_for_models(m, c, weights, row["strength"], row["strength"])
        return (m, c)