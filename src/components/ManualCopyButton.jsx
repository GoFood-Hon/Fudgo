import { useEffect, useRef, useState } from "react"
import { showNotification } from "@mantine/notifications"

const copyToClipboard = async (value) => {
  if (!value || typeof document === "undefined") {
    return false
  }

  if (typeof window !== "undefined" && window.isSecureContext && navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return true
  }

  const textArea = document.createElement("textarea")
  textArea.value = value
  textArea.setAttribute("readonly", "")
  textArea.style.position = "fixed"
  textArea.style.opacity = "0"
  textArea.style.pointerEvents = "none"

  document.body.appendChild(textArea)

  const selection = document.getSelection()
  const selectedRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null

  textArea.focus()
  textArea.select()
  textArea.setSelectionRange(0, textArea.value.length)

  const copied = document.execCommand("copy")

  document.body.removeChild(textArea)

  if (selection && selectedRange) {
    selection.removeAllRanges()
    selection.addRange(selectedRange)
  }

  return copied
}

export const ManualCopyButton = ({ value, timeout = 2000, errorMessage = "No se pudo copiar al portapapeles", children }) => {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current && typeof window !== "undefined") {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const copy = async () => {
    try {
      const hasCopied = await copyToClipboard(value)

      if (!hasCopied) {
        throw new Error("copy_failed")
      }

      setCopied(true)

      if (timeoutRef.current && typeof window !== "undefined") {
        window.clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = window.setTimeout(() => {
        setCopied(false)
      }, timeout)
    } catch {
      showNotification({
        title: "Error",
        message: errorMessage,
        color: "red",
        duration: 4000
      })
    }
  }

  return children({ copied, copy })
}
