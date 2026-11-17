import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CopyLinkButton } from '../CopyLinkButton'

describe('CopyLinkButton', () => {
  it('copies the current address and confirms inline', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    window.history.replaceState(null, '', '/total-database/extensions?q=.mkv')

    render(<CopyLinkButton />)
    await userEvent.click(screen.getByRole('button', { name: /copy view link/i }))

    expect(writeText).toHaveBeenCalledWith(window.location.href)
    expect(await screen.findByText(/link copied/i)).toBeInTheDocument()
  })
})
