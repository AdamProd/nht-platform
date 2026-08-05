# -*- coding: utf-8 -*-
import json
from copy import deepcopy
from pathlib import Path

def base_en():
  return json.loads(Path('/Users/vladevstigneev/agency/scripts/_tasks_i18n_en.json').read_text(encoding='utf-8'))

root = Path('/Users/vladevstigneev/agency')
en = json.loads((root / 'scripts/_tasks_i18n_en.json').read_text(encoding='utf-8'))
ru = json.loads((root / 'scripts/_tasks_i18n_ru.json').read_text(encoding='utf-8'))
de = json.loads((root / 'scripts/_tasks_i18n_de.json').read_text(encoding='utf-8'))
events = json.loads((root / 'scripts/_tasks_i18n_events.json').read_text(encoding='utf-8'))

for path in sorted((root / 'messages').glob('*.json')):
  data = json.loads(path.read_text(encoding='utf-8'))
  loc = path.stem
  if loc == 'en':
    data['admin']['tasks'] = en
  elif loc == 'ru':
    data['admin']['tasks'] = ru
  elif loc == 'de':
    data['admin']['tasks'] = de
  else:
    current = data['admin'].get('tasks', {})
    merged = deepcopy(en)
    for key in ('filters', 'sort', 'empty', 'kpis', 'form'):
      if isinstance(current.get(key), dict):
        merged[key].update({k: v for k, v in current[key].items() if isinstance(v, str)})
    merged['status'] = en['status']
    merged['deadline'] = en['deadline']
    merged['timeline'] = en['timeline']
    merged['detail'] = {**en['detail'], **(current.get('detail') or {})}
    merged['fields'] = {**en['fields'], **(current.get('fields') or {})}
    merged['actions'] = {**en['actions'], **(current.get('actions') or {})}
    merged['actionErrors'] = {**en['actionErrors'], **(current.get('actionErrors') or {})}
    data['admin']['tasks'] = merged
  data.setdefault('events', {}).setdefault('catalog', {}).update(events)
  path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
  print('ok', loc)
