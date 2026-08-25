import joblib, numpy as np

for name in ["diabetes", "hypertension", "heart", "obesity", "stress"]:
    splits = joblib.load(f"data/processed/{name}_splits.pkl")
    print(f"\n=== {name} ===")
    print(f"  type: {type(splits)}")
    if isinstance(splits, dict):
        print(f"  keys: {list(splits.keys())}")
    elif isinstance(splits, (list, tuple)):
        print(f"  len: {len(splits)}")
        for i, item in enumerate(splits):
            if hasattr(item, 'shape'):
                print(f"  [{i}]: {type(item).__name__} shape={item.shape}")
            elif hasattr(item, '__len__'):
                print(f"  [{i}]: {type(item).__name__} len={len(item)}")
            else:
                print(f"  [{i}]: {type(item)}")
    else:
        print(f"  unknown: {splits}")
