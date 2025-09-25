# ================================================================
# SIH 2025 - ML Integration Setup Script
# ================================================================

import os
import sys
import subprocess
import platform

def run_command(command, cwd=None):
    """Run a command and return success status"""
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {command}")
            return True
        else:
            print(f"❌ {command}")
            print(f"   Error: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ {command}")
        print(f"   Exception: {e}")
        return False

def check_python():
    """Check if Python is installed"""
    try:
        version = subprocess.check_output([sys.executable, '--version'], 
                                        stderr=subprocess.STDOUT)
        print(f"✅ Python: {version.decode().strip()}")
        return True
    except:
        print("❌ Python not found")
        return False

def check_node():
    """Check if Node.js is installed"""
    try:
        version = subprocess.check_output(['node', '--version'], 
                                        stderr=subprocess.STDOUT)
        print(f"✅ Node.js: {version.decode().strip()}")
        return True
    except:
        print("❌ Node.js not found")
        return False

def setup_backend():
    """Set up Python backend"""
    print("\n🔧 Setting up Backend...")
    
    backend_dir = "backend"
    if not os.path.exists(backend_dir):
        print(f"❌ Backend directory not found: {backend_dir}")
        return False
    
    # Create virtual environment
    venv_command = "python -m venv venv"
    if not run_command(venv_command, cwd=backend_dir):
        return False
    
    # Determine activation command based on OS
    if platform.system() == "Windows":
        activate_cmd = "venv\\Scripts\\activate"
        pip_cmd = "venv\\Scripts\\pip"
    else:
        activate_cmd = "source venv/bin/activate"
        pip_cmd = "venv/bin/pip"
    
    # Install requirements
    install_cmd = f"{pip_cmd} install -r requirements.txt"
    if not run_command(install_cmd, cwd=backend_dir):
        return False
    
    print("✅ Backend setup complete!")
    return True

def setup_frontend():
    """Set up React frontend"""
    print("\n🔧 Setting up Frontend...")
    
    frontend_dir = "frontend"
    if not os.path.exists(frontend_dir):
        print(f"❌ Frontend directory not found: {frontend_dir}")
        return False
    
    # Install npm dependencies
    if not run_command("npm install", cwd=frontend_dir):
        return False
    
    print("✅ Frontend setup complete!")
    return True

def create_env_file():
    """Create environment configuration"""
    print("\n🔧 Creating environment configuration...")
    
    frontend_env = """# Environment Configuration
REACT_APP_USE_ML_BACKEND=true
REACT_APP_API_BASE_URL=http://localhost:5000/api
"""
    
    with open("frontend/.env", "w") as f:
        f.write(frontend_env)
    
    print("✅ Environment file created!")
    return True

def copy_ml_files():
    """Copy ML files to backend directory"""
    print("\n🔧 Setting up ML integration...")
    
    ml_dir = "ml"
    backend_dir = "backend"
    
    if not os.path.exists(ml_dir):
        print(f"❌ ML directory not found: {ml_dir}")
        return False
    
    # Create symlink or copy ML files
    if platform.system() == "Windows":
        # Windows: copy key files
        import shutil
        key_files = [
            "param_ml_pipeline.py",
            "final_clean_students_14k.csv",
            "sample_students.csv"
        ]
        
        for file in key_files:
            src = os.path.join(ml_dir, file)
            dst = os.path.join(backend_dir, file)
            if os.path.exists(src):
                shutil.copy2(src, dst)
                print(f"✅ Copied {file}")
    else:
        # Unix: create symlink
        ml_link = os.path.join(backend_dir, "ml")
        if not os.path.exists(ml_link):
            os.symlink(os.path.abspath(ml_dir), ml_link)
            print("✅ ML symlink created")
    
    return True

def main():
    print("🚀 SIH 2025 ML Integration Setup")
    print("=" * 50)
    
    # Check prerequisites
    print("📋 Checking prerequisites...")
    if not check_python():
        print("Please install Python 3.8+ and try again")
        return
    
    if not check_node():
        print("Please install Node.js and try again")
        return
    
    # Setup steps
    success = True
    success &= setup_backend()
    success &= setup_frontend()
    success &= create_env_file()
    success &= copy_ml_files()
    
    if success:
        print("\n🎉 Setup Complete!")
        print("=" * 50)
        print("To start the application:")
        print("1. Backend:  cd backend && python app.py")
        print("2. Frontend: cd frontend && npm run dev")
        print("\n🌐 Application will be available at:")
        print("   Frontend: http://localhost:5173")
        print("   Backend:  http://localhost:5000")
    else:
        print("\n❌ Setup failed. Please check errors above.")

if __name__ == "__main__":
    main()