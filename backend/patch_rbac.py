import os

routes_dir = '/Users/mac1/Documents/Hackathons/finspark/Finspark/backend/app/routes'

def patch_file(filename):
    filepath = os.path.join(routes_dir, filename)
    with open(filepath, 'r') as f:
        content = f.read()
    
    # ensure get_current_user is imported
    if "from app.middleware.auth import" in content and "get_current_user" not in content:
        content = content.replace("from app.middleware.auth import RoleChecker", "from app.middleware.auth import RoleChecker, get_current_user")
    elif "from app.middleware.auth import get_current_user" not in content:
        content = "from app.middleware.auth import get_current_user\n" + content
    
    # replace GET route dependencies
    # we want to replace analyst_only with get_current_user for @router.get endpoints
    lines = content.split('\n')
    in_get = False
    for i, line in enumerate(lines):
        if line.startswith('@router.get'):
            in_get = True
        elif line.startswith('@router.post') or line.startswith('@router.put') or line.startswith('@router.delete'):
            in_get = False
        
        if in_get and "Depends(analyst_only)" in line:
            lines[i] = line.replace("Depends(analyst_only)", "Depends(get_current_user)")
            
    new_content = '\n'.join(lines)
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Patched GET routes in {filename}")

for f in os.listdir(routes_dir):
    if f.endswith('.py'):
        patch_file(f)
