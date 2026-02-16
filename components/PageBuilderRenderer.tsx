"use client"

import React from "react"
import type { PuckData, PuckComponentData } from "@/hooks/usePageBuilderSection"

function resolveImageSrc(src: string | undefined): string {
  if (!src) return ""
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) return src
  const base = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || ""
  return `${base.replace(/\/$/, "")}/uploads/${src.replace(/^\//, "")}`
}

function BlockRenderer({ item }: { item: PuckComponentData }) {
  const { type, props: p } = item
  const props = (p || {}) as Record<string, unknown>

  switch (type) {
    case "Heading": {
      const Tag = ((props.level as string) || "h1") as keyof JSX.IntrinsicElements
      return (
        <Tag style={{ fontSize: props.fontSize ? `${props.fontSize}px` : undefined }}>
          {String(props.text ?? "")}
        </Tag>
      )
    }
    case "Text":
      return (
        <p style={{ fontSize: props.fontSize ? `${props.fontSize}px` : undefined }}>
          {String(props.content ?? "")}
        </p>
      )
    case "Image": {
      const src = resolveImageSrc(props.src as string)
      const img = (
        <img
          src={src || ""}
          alt={String(props.alt ?? "")}
          style={{
            width: props.width ? `${props.width}px` : undefined,
            height: props.height ? `${props.height}px` : undefined,
            objectFit: (props.objectFit as React.CSSProperties["objectFit"]) || "cover",
          }}
        />
      )
      return props.href ? <a href={String(props.href)}>{img}</a> : img
    }
    case "Button":
      return (
        <a
          href={String(props.href ?? "#")}
          target={String(props.target ?? "_self")}
          rel={props.target === "_blank" ? "noopener noreferrer" : undefined}
        >
          {String(props.label ?? "Botón")}
        </a>
      )
    case "Link":
      return (
        <a
          href={String(props.href ?? "#")}
          target={String(props.target ?? "_self")}
          rel={props.target === "_blank" ? "noopener noreferrer" : undefined}
        >
          {String(props.text ?? "Enlace")}
        </a>
      )
    case "Spacer":
      return <div style={{ height: `${Number(props.height) || 24}px` }} aria-hidden />
    case "Divider":
      return <hr style={{ borderWidth: `${Number(props.thickness) || 1}px`, margin: "8px 0" }} />
    case "Container": {
      const content = (props.content as PuckComponentData[]) || []
      return (
        <div
          style={{
            maxWidth: props.maxWidth ? `${props.maxWidth}px` : undefined,
            paddingLeft: props.paddingX ? `${props.paddingX}px` : undefined,
            paddingRight: props.paddingX ? `${props.paddingX}px` : undefined,
            paddingTop: props.paddingY ? `${props.paddingY}px` : undefined,
            paddingBottom: props.paddingY ? `${props.paddingY}px` : undefined,
            margin: "0 auto",
          }}
        >
          {content.map((child, i) => (
            <BlockRenderer key={(child.props?.id as string) || i} item={child} />
          ))}
        </div>
      )
    }
    case "Flex": {
      const content = (props.content as PuckComponentData[]) || []
      return (
        <div
          style={{
            display: "flex",
            flexDirection: ((props.direction as string) || "column") as React.CSSProperties["flexDirection"],
            gap: props.gap ? `${props.gap}px` : 16,
            alignItems:
              props.align === "start" ? "flex-start" : props.align === "end" ? "flex-end" : "center",
            justifyContent:
              props.justify === "start"
                ? "flex-start"
                : props.justify === "end"
                  ? "flex-end"
                  : props.justify === "between"
                    ? "space-between"
                    : "center",
          }}
        >
          {content.map((child, i) => (
            <BlockRenderer key={(child.props?.id as string) || i} item={child} />
          ))}
        </div>
      )
    }
    case "Grid": {
      const content = (props.content as PuckComponentData[]) || []
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Number(props.columns) || 3}, 1fr)`,
            gap: props.gap ? `${props.gap}px` : 16,
            rowGap: props.rowGap ? `${props.rowGap}px` : 16,
          }}
        >
          {content.map((child, i) => (
            <BlockRenderer key={(child.props?.id as string) || i} item={child} />
          ))}
        </div>
      )
    }
    case "Card":
      return (
        <div style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8 }}>
          {Boolean(props.imageUrl) && (
            <img
              src={resolveImageSrc(props.imageUrl as string)}
              alt={String(props.title ?? "")}
              style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 4 }}
            />
          )}
          {Boolean(props.title) && <h3 style={{ marginTop: 8 }}>{String(props.title)}</h3>}
          {Boolean(props.description) && (
            <p style={{ marginTop: 4, fontSize: 14 }}>{String(props.description)}</p>
          )}
          {Boolean(props.linkUrl) && (
            <a href={String(props.linkUrl)} style={{ display: "inline-block", marginTop: 8 }}>
              {String(props.linkText ?? "Ver más")}
            </a>
          )}
        </div>
      )
    case "Section": {
      const content = (props.content as PuckComponentData[]) || []
      return (
        <section id={props.id as string}>
          {Boolean(props.title) && <h2 style={{ marginBottom: 16 }}>{String(props.title)}</h2>}
          {content.map((child, i) => (
            <BlockRenderer key={(child.props?.id as string) || i} item={child} />
          ))}
        </section>
      )
    }
    case "Columns": {
      const content = (props.content as PuckComponentData[]) || []
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Number(props.count) || 2}, 1fr)`,
            gap: props.gap ? `${props.gap}px` : 24,
          }}
        >
          {content.map((child, i) => (
            <BlockRenderer key={(child.props?.id as string) || i} item={child} />
          ))}
        </div>
      )
    }
    case "Carousel": {
      const content = (props.content as PuckComponentData[]) || []
      return (
        <div style={{ overflow: "auto", display: "flex", gap: 16 }}>
          {content.map((child, i) => (
            <BlockRenderer key={(child.props?.id as string) || i} item={child} />
          ))}
        </div>
      )
    }
    case "Background": {
      const content = (props.content as PuckComponentData[]) || []
      const imageUrl = props.imageUrl as string
      return (
        <div style={{ position: "relative", minHeight: 200 }}>
          {props.videoUrl ? (
            <div style={{ position: "absolute", inset: 0, background: "#111" }}>
              <span style={{ color: "#999" }}>Video: {String(props.videoUrl)}</span>
            </div>
          ) : imageUrl ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${resolveImageSrc(imageUrl)})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          ) : (
            <div style={{ position: "absolute", inset: 0, background: "#eee" }} />
          )}
          <div style={{ position: "relative", zIndex: 1, padding: 24 }}>
            {content.map((child, i) => (
              <BlockRenderer key={(child.props?.id as string) || i} item={child} />
            ))}
          </div>
        </div>
      )
    }
    case "ProductCollection":
      return (
        <div style={{ padding: 16, border: "1px dashed #999" }}>
          Productos (collectionId: {String(props.collectionId ?? "—")})
        </div>
      )
    case "BlogList":
      return (
        <div style={{ padding: 16, border: "1px dashed #999" }}>
          Blog (limit: {Number(props.limit) ?? 5}
          {props.type ? `, type: ${props.type}` : ""}
        </div>
      )
    default:
      return (
        <div style={{ padding: 8, border: "1px dashed #ccc", color: "#666" }}>
          [{type}]
        </div>
      )
  }
}

export function PageBuilderRenderer({ data }: { data: PuckData }) {
  const content = data.content || []
  if (content.length === 0) return null

  return (
    <div style={{ padding: 16 }} data-page-builder-skeleton>
      {content.map((item, i) => (
        <BlockRenderer key={(item.props?.id as string) || i} item={item} />
      ))}
    </div>
  )
}
