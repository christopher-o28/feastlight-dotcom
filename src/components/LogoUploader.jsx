import { useState } from 'react'
import { Upload, Copy, Check } from 'lucide-react'

export default function LogoUploader({ currentLogo, onLogoPathChange }) {
  const [copied, setCopied] = useState(false)
  const [manualPath, setManualPath] = useState(currentLogo || '/logo.png')

  const handleCopyPath = () => {
    navigator.clipboard.writeText(manualPath)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePathChange = (newPath) => {
    setManualPath(newPath)
    onLogoPathChange?.(newPath)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="font-bold text-feast-dark mb-4">Logo Management</h3>

      {/* Current Logo Preview */}
      {currentLogo && (
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3 font-medium">Current Logo:</p>
          <div className="flex items-center gap-4">
            <img
              src={currentLogo}
              alt="Current logo"
              className="w-16 h-16 rounded-full object-cover border border-gray-200 bg-gray-100"
              onError={(e) => {
                e.target.src = '/placeholder.png'
              }}
            />
            <div className="flex-1">
              <p className="text-sm text-gray-700 break-all">{currentLogo}</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Upload size={16} />
          How to Upload a Logo
        </h4>
        <ol className="text-sm text-blue-800 space-y-2">
          <li>1. Prepare your logo image (PNG, JPG, or GIF - recommended size: 48x48px or larger)</li>
          <li>2. Place the image file in the <code className="bg-blue-100 px-2 py-1 rounded">public</code> folder</li>
          <li>3. Note the filename (e.g., <code className="bg-blue-100 px-2 py-1 rounded">logo.png</code>)</li>
          <li>4. Update the path below or in your settings</li>
        </ol>
      </div>

      {/* Logo Path Input */}
      <div className="space-y-3">
        <label className="block">
          <p className="text-sm font-medium text-gray-700 mb-2">Logo Image Path:</p>
          <input
            type="text"
            value={manualPath}
            onChange={(e) => handlePathChange(e.target.value)}
            placeholder="/logo.png"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-feast-red focus:border-transparent outline-none transition"
          />
          <p className="text-xs text-gray-500 mt-1">Path must be relative to the public folder (e.g., /logo.png or /images/logo.png)</p>
        </label>

        <button
          onClick={handleCopyPath}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-feast-red text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
        >
          {copied ? (
            <>
              <Check size={16} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={16} />
              Copy Path
            </>
          )}
        </button>
      </div>

      {/* File Structure Info */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Expected file structure:</p>
        <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-auto">
{`public/
├── logo.png          (your logo image)
├── images.png
└── favicon.svg`}
        </pre>
      </div>
    </div>
  )
}
