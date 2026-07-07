// Generates the app icon and splash source images with CoreGraphics.
// The motif is the app's core gesture: lines of writing, one highlighted.
//
// Usage: swift scripts/generate-app-art.swift
// Writes: assets/icon-only.png (1024), assets/splash.png + splash-dark.png (2732)

import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

let paper = CGColor(red: 0.980, green: 0.965, blue: 0.937, alpha: 1) // #FAF6EF
let ink = CGColor(red: 0.165, green: 0.145, blue: 0.114, alpha: 1) // #2A251D
let highlight = CGColor(red: 1.000, green: 0.851, blue: 0.549, alpha: 1) // #FFD98C

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

/// Draws the motif into a square region: four lines of "writing",
/// the second one swept with a slightly tilted highlighter stroke.
func drawMotif(_ ctx: CGContext, origin: CGPoint, side: CGFloat) {
    let u = side / 1024 // design units on a 1024 grid
    let left = origin.x + 232 * u
    let lineH = 58 * u
    let gap = 154 * u
    // Four lines, top to bottom (CG y-axis is bottom-up).
    let widths: [CGFloat] = [560, 470, 512, 320]
    let topY = origin.y + side - 302 * u
    for (i, w) in widths.enumerated() {
        let y = topY - CGFloat(i) * gap
        if i == 1 {
            // Highlighter sweep behind the line: wider, taller, hand-tilted.
            roundedBar(ctx, x: left - 40 * u, y: y - 34 * u, w: w * u + 116 * u, h: lineH + 68 * u,
                       color: highlight, rotation: -0.026)
        }
        roundedBar(ctx, x: left, y: y, w: w * u, h: lineH, color: ink)
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

// App icon: full-bleed paper, motif fills the canvas. (1024, no alpha needed)
let icon = makeContext(size: 1024)
icon.setFillColor(paper)
icon.fill(CGRect(x: 0, y: 0, width: 1024, height: 1024))
drawMotif(icon, origin: .zero, side: 1024)
writePNG(icon, to: "assets/icon-only.png")

// Splash: paper field with a smaller centered motif.
for (name, bg) in [("splash", paper), ("splash-dark", paper)] {
    let splash = makeContext(size: 2732)
    splash.setFillColor(bg)
    splash.fill(CGRect(x: 0, y: 0, width: 2732, height: 2732))
    let side: CGFloat = 820
    drawMotif(splash, origin: CGPoint(x: (2732 - side) / 2, y: (2732 - side) / 2), side: side)
    writePNG(splash, to: "assets/\(name).png")
}
