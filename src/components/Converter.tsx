import { useState } from 'react'
import { parseStorageToBytes } from '../data/aggregateDatabase'
import { formatBytesWithUnit, type StorageUnit } from '../data/storageUnitContext'

const UNITS: StorageUnit[] = ['PB', 'TB', 'GB', 'MB']

/**
 * Quick PB ↔ TB ↔ GB ↔ MB converter built on the same parser the reports use,
 * so a figure typed here matches the figure shown in a table exactly.
 */
export function UnitConverter() {
  const [value, setValue] = useState('1654.24')
  const [unit, setUnit] = useState<StorageUnit>('TB')

  const numeric = Number(value.replace(',', '.'))
  const bytes = Number.isFinite(numeric) ? numeric * parseStorageToBytes(`1 ${unit}`) : 0

  return (
    <div className="converter">
      <div className="converter__input">
        <label className="field">
          <span className="visually-hidden">Storage value</span>
          <input
            type="text"
            inputMode="decimal"
            value={value}
            aria-label="Storage value"
            onChange={(event) => setValue(event.target.value)}
          />
        </label>
        <select
          className="select"
          value={unit}
          aria-label="Storage unit"
          onChange={(event) => setUnit(event.target.value as StorageUnit)}
        >
          {UNITS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <dl className="converter__out">
        {UNITS.map((option) => (
          <div key={option}>
            <dt>{option}</dt>
            <dd>{bytes > 0 ? formatBytesWithUnit(bytes, option) : '—'}</dd>
          </div>
        ))}
        <div>
          <dt>Bytes</dt>
          <dd>{bytes > 0 ? Math.round(bytes).toLocaleString('en-GB') : '—'}</dd>
        </div>
      </dl>
    </div>
  )
}
