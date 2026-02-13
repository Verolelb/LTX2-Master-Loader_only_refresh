from .ltx2_master_loader import LTX2MasterLoaderLD

NODE_CLASS_MAPPINGS = { "LTX2MasterLoaderLD": LTX2MasterLoaderLD }
NODE_DISPLAY_NAME_MAPPINGS = { "LTX2MasterLoaderLD": "🕹️ LTX-2 Master Loader - LoRa-Daddy" }
WEB_DIRECTORY = "./web"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]