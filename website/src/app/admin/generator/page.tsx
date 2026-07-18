"use client"

import * as React from "react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { functions } from "@/lib/firebase"
import { httpsCallable } from "firebase/functions"
import { LucideRefreshCw, LucideServer } from "lucide-react"

type GeneratedDevice = {
  deviceId: string
  serialNumber: string
  activationCode: string
  secretKey: string
}

export default function DeviceGeneratorPage() {
  const [loading, setLoading] = React.useState(false)
  const [quantity, setQuantity] = React.useState(1)
  const [hardwareModel, setHardwareModel] = React.useState("SH-ESP32-V1")
  const [generatedDevices, setGeneratedDevices] = React.useState<GeneratedDevice[]>([])
  const [status, setStatus] = React.useState<string>("")

  const handleGenerate = async () => {
    setLoading(true)
    setStatus("")
    try {
      const generateFn = httpsCallable(functions, "generateDevice")
      const result = await generateFn({ hardwareModel, batchId: `BATCH-${Date.now()}`, quantity }) as { data: { success: boolean; devices: GeneratedDevice[] } }
      if (result.data?.success) {
        setGeneratedDevices(result.data.devices)
        setStatus(`Generated ${result.data.devices.length} devices successfully.`)
      }
    } catch (error) {
      console.error("Error generating devices", error)
      setStatus("Generation failed. Ensure your Firebase Functions deployment is available.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Device Generator</h1>
        <p className="text-muted-foreground">
          Batch generate new commercial devices. This will create secure tokens, activation codes, and QR codes for printing.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Generator Settings</CardTitle>
            <CardDescription>Configure the parameters for the new batch of devices.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hardwareModel">Hardware Model</Label>
              <Input 
                id="hardwareModel" 
                value={hardwareModel} 
                onChange={(e) => setHardwareModel(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input 
                id="quantity" 
                type="number" 
                min="1" 
                max="1000" 
                value={quantity} 
                onChange={(e) => setQuantity(Number(e.target.value))} 
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGenerate} disabled={loading} className="w-full">
              {loading ? (
                <LucideRefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LucideServer className="mr-2 h-4 w-4" />
              )}
              {loading ? "Generating Devices..." : "Generate Devices"}
            </Button>
          </CardFooter>
        </Card>

        {status ? (
          <Card className="md:col-span-2">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{status}</p>
            </CardContent>
          </Card>
        ) : null}

        {generatedDevices.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Generated Batch</CardTitle>
              <CardDescription>
                {generatedDevices.length} devices generated. Please export and print the QR codes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedDevices.map((device, idx) => {
                  const qrUrl = `https://yourdomain.com/activate?device=${device.deviceId}&code=${device.activationCode}`;
                  return (
                    <div key={device.deviceId} className="flex flex-col items-center border rounded-lg p-6 bg-card">
                      <QRCodeSVG value={qrUrl} size={150} level={"H"} includeMargin={true} />
                      <div className="mt-4 text-center space-y-1">
                        <p className="font-mono text-sm font-bold">{device.deviceId}</p>
                        <p className="font-mono text-xs text-muted-foreground">{device.serialNumber}</p>
                        <p className="font-mono text-xs text-primary">{device.activationCode}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
