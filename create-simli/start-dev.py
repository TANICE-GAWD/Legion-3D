#!/usr/bin/env python3
"""
Development startup script for create-simli with integrated Python backend
"""

import subprocess
import sys
import os
import time
import signal
from pathlib import Path

def install_python_deps():
    """Install Python dependencies"""
    print("📦 Installing Python dependencies...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
        print("✅ Python dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install Python dependencies: {e}")
        return False
    return True

def install_node_deps():
    """Install Node.js dependencies"""
    print("📦 Installing Node.js dependencies...")
    try:
        subprocess.run(["npm", "install"], check=True)
        print("✅ Node.js dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install Node.js dependencies: {e}")
        return False
    return True

def start_python_server():
    """Start the Python FastAPI server"""
    print("🐍 Starting Python FastAPI server on port 8000...")
    env = os.environ.copy()
    env["PYTHONPATH"] = str(Path.cwd())
    
    return subprocess.Popen([
        sys.executable, "-m", "uvicorn", 
        "api.main:app", 
        "--host", "0.0.0.0", 
        "--port", "8000", 
        "--reload"
    ], env=env)

def start_nextjs_server():
    """Start the Next.js development server"""
    print("⚡ Starting Next.js development server on port 3000...")
    return subprocess.Popen(["npm", "run", "dev"])

def main():
    """Main function to start both servers"""
    print("🚀 Starting create-simli development environment...")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not Path("package.json").exists() or not Path("requirements.txt").exists():
        print("❌ Please run this script from the create-simli directory")
        sys.exit(1)
    
    # Install dependencies
    if not install_python_deps():
        sys.exit(1)
    
    if not install_node_deps():
        sys.exit(1)
    
    print("\n" + "=" * 50)
    print("🎯 Starting development servers...")
    
    # Start servers
    python_process = start_python_server()
    time.sleep(3)  # Give Python server time to start
    
    nextjs_process = start_nextjs_server()
    
    print("\n" + "=" * 50)
    print("✅ Development environment is ready!")
    print("🌐 Next.js frontend: http://localhost:3000")
    print("🐍 Python API: http://localhost:8000")
    print("📚 API docs: http://localhost:8000/docs")
    print("\n💡 Press Ctrl+C to stop both servers")
    print("=" * 50)
    
    def signal_handler(sig, frame):
        print("\n🛑 Shutting down servers...")
        python_process.terminate()
        nextjs_process.terminate()
        
        # Wait for processes to terminate
        python_process.wait()
        nextjs_process.wait()
        
        print("✅ Servers stopped successfully")
        sys.exit(0)
    
    # Handle Ctrl+C
    signal.signal(signal.SIGINT, signal_handler)
    
    try:
        # Wait for both processes
        while True:
            if python_process.poll() is not None:
                print("❌ Python server stopped unexpectedly")
                break
            if nextjs_process.poll() is not None:
                print("❌ Next.js server stopped unexpectedly")
                break
            time.sleep(1)
    except KeyboardInterrupt:
        signal_handler(None, None)

if __name__ == "__main__":
    main()