const { spawn } = require('child_process');

function run(command, args, cwd) {
    console.log(`[Workspace] Starting ${command} ${args.join(' ')} in ${cwd}...`);
    const proc = spawn(command, args, { 
        cwd, 
        shell: true, 
        stdio: 'inherit' 
    });

    proc.on('error', (err) => {
        console.error(`[Workspace] Failed to start ${command}:`, err);
    });

    return proc;
}

// 1. Launch C# Backend on port 5100
run('dotnet', ['run', '--project', '../backend'], '.');

// 2. Launch Customer App on port 4300
run('npx', ['ng', 'serve'], 'customer');

// 3. Launch Admin App on port 4200
run('npx', ['ng', 'serve'], 'admin');
