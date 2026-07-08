// Generates the app icon and splash source images with CoreGraphics.
// Style follows the UrbanPyx house look: warm cream paper, a gold editorial
// rule-frame, and an oxblood accent. The motif is the app's core gesture —
// lines of writing with the "reframed" thought highlighted (gold sweep) and
// drawn in oxblood.
//
// Usage: swift scripts/generate-app-art.swift
// Writes: assets/icon-only.png (1024), assets/splash.png + splash-dark.png (2732)

import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

let cream    = CGColor(red: 0.980, green: 0.965, blue: 0.933, alpha: 1) // #FAF6EE
let ink      = CGColor(red: 0.110, green: 0.098, blue: 0.090, alpha: 1) // #1C1917
let oxblood  = CGColor(red: 0.608, green: 0.133, blue: 0.149, alpha: 1) // #9B2226
let gold     = CGColor(red: 0.722, green: 0.525, blue: 0.043, alpha: 1) // #B8860B
let goldSoft = CGColor(red: 0.820, green: 0.640, blue: 0.180, alpha: 0.42) // highlighter wash

func makeContext(size: Int) -> CGContext {
    let space = CGColorSpace(name: CGColorSpace.sRGB)!
    return CGContext(
        data: nil, width: size, height: size, bitsPerComponent: 8, bytesPerRow: 0,
        space: space, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
    )!
}

func roundedBar(_ ctx: CGContext, x: CGFloat, y: CGFloat, w: CGFloat, h: CGFloat,
                color: CGColor, rotation: CGFloat = 0) {
    ctx.saveGState()
    let cx = x + w / 2, cy = y + h / 2
    ctx.translateBy(x: cx, y: cy)
    ctx.rotate(by: rotation)
    let rect = CGRect(x: -w / 2, y: -h / 2, width: w, height: h)
    let path = CGPath(roundedRect: rect, cornerWidth: h / 2, cornerHeight: h / 2, transform: nil)
    ctx.addPath(path)
    ctx.setFillColor(color)
    ctx.fillPath()
    ctx.restoreGState()
}

/// A gold rule-frame inset from the edges — the UrbanPyx "bookplate" device.
/// `scale` maps the 1024 design grid onto the target canvas.
func ruleFrame(_ ctx: CGContext, canvas: CGFloat, scale: CGFloat) {
    func stroke(inset: CGFloat, lw: CGFloat, radius: CGFloat) {
        let r = CGRect(x: inset, y: inset, width: canvas - 2 * inset, height: canvas - 2 * inset)
        ctx.addPath(CGPath(roundedRect: r, cornerWidth: radius, cornerHeight: radius, transform: nil))
        ctx.setStrokeColor(gold)
        ctx.setLineWidth(lw)
        ctx.setLineJoin(.round)
        ctx.strokePath()
    }
    stroke(inset: 90 * scale, lw: 7 * scale, radius: 168 * scale)
    stroke(inset: 116 * scale, lw: 3.5 * scale, radius: 146 * scale)
}

/// Draws the motif into a square region: three lines of "writing", the middle
/// one swept with a gold highlighter and drawn in oxblood — the balanced thought.
func drawMotif(_ ctx: CGContext, origin: CGPoint, side: CGFloat) {
    let u = side / 1024 // design units on a 1024 grid
    let left = origin.x + 312 * u
    let lineH = 60 * u
    let gap = 152 * u
    let widths: [CGFloat] = [408, 366, 260] // top, middle, bottom
    let midY = origin.y + side / 2
    for (i, w) in widths.enumerated() {
        let cy = midY + gap - CGFloat(i) * gap // i0 top, i1 middle, i2 bottom
        let y = cy - lineH / 2
        if i == 1 {
            roundedBar(ctx, x: left - 36 * u, y: y - 32 * u, w: w * u + 156 * u, h: lineH + 64 * u,
                       color: goldSoft, rotation: -0.03)
            roundedBar(ctx, x: left, y: y, w: w * u, h: lineH, color: oxblood)
        } else {
            roundedBar(ctx, x: left, y: y, w: w * u, h: lineH, color: ink)
        }
    }
}

func writePNG(_ ctx: CGContext, to path: String) {
    let image = ctx.makeImage()!
    let url = URL(fileURLWithPath: path) as CFURL
    let dest = CGImageDestinationCreateWithURL(url, UTType.png.identifier as CFString, 1, nil)!
    CGImageDestinationAddImage(dest, image, nil)
    CGImageDestinationFinalize(dest)
    print("wrote \(path)")
}

let fm = FileManager.default
try? fm.createDirectory(atPath: "assets", withIntermediateDirectories: true)

// App icon: full-bleed cream, gold rule-frame, motif centered. (1024, no alpha needed)
let icon = makeContext(size: 1024)
icon.setFillColor(cream)
icon.fill(CGRect(x: 0, y: 0, width: 1024, height: 1024))
ruleFrame(icon, canvas: 1024, scale: 1)
drawMotif(icon, origin: .zero, side: 1024)
writePNG(icon, to: "assets/icon-only.png")

// Splash: cream field with a smaller centered motif (no frame at full-screen scale).
for name in ["splash", "splash-dark"] {
    let splash = makeContext(size: 2732)
    splash.setFillColor(cream)
    splash.fill(CGRect(x: 0, y: 0, width: 2732, height: 2732))
    let side: CGFloat = 820
    drawMotif(splash, origin: CGPoint(x: (2732 - side) / 2, y: (2732 - side) / 2), side: side)
    writePNG(splash, to: "assets/\(name).png")
}
