"""
MonitorShade brightness daemon.
Stays alive and processes JSON commands over stdin/stdout.
"""
import sys
import json
import screen_brightness_control as sbc

def handle_command(cmd):
    action = cmd.get('action')
    try:
        if action == 'get':
            display_id = cmd.get('display', 0)
            result = sbc.get_brightness(display=display_id)
            val = result[0] if isinstance(result, list) else result
            return {'ok': True, 'value': val}

        elif action == 'set':
            display_id = cmd.get('display', 0)
            value = cmd.get('value', 100)
            sbc.set_brightness(value, display=display_id)
            return {'ok': True}

        elif action == 'list':
            monitors = sbc.list_monitors()
            return {'ok': True, 'monitors': monitors}

        elif action == 'ping':
            return {'ok': True, 'pong': True}

        else:
            return {'ok': False, 'error': f'Unknown action: {action}'}

    except Exception as e:
        return {'ok': False, 'error': str(e)}

def main():
    sys.stdout.write(json.dumps({'ok': True, 'ready': True}) + '\n')
    sys.stdout.flush()

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            cmd = json.loads(line)
            result = handle_command(cmd)
        except json.JSONDecodeError as e:
            result = {'ok': False, 'error': f'Invalid JSON: {e}'}
        except Exception as e:
            result = {'ok': False, 'error': str(e)}

        sys.stdout.write(json.dumps(result) + '\n')
        sys.stdout.flush()

if __name__ == '__main__':
    main()
