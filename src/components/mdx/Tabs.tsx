"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  type ComponentProps,
  type ReactNode,
} from "react";
import {
  cardVariants,
  cn,
  Tabs as TabsRoot,
  TabsContent as PackageTabsContent,
  TabsList as PackageTabsList,
  TabsTrigger,
} from "@divineskins/ui";

export { TabsTrigger };

interface TabsProps extends ComponentProps<typeof TabsRoot> {
  /** Simple mode: one trigger per item, paired with `<Tab>`s. */
  items?: string[];
  defaultIndex?: number;
  children?: ReactNode;
}

const TabsContext = createContext<{
  items?: string[];
  collection: string[];
} | null>(null);

// Matches fumadocs, whose API the guides were written against.
function escapeValue(value: string) {
  return value.toLowerCase().replace(/\s/, "-");
}

/**
 * The package's pill Tabs in a Card, with the API the guides already use:
 * `items` plus `<Tab>`, or `defaultValue` plus `TabsList` / `TabsTrigger` /
 * `TabsContent`. Inactive panels stay in the page, so find-in-page and search
 * engines still reach them.
 */
export function Tabs({
  items,
  defaultIndex = 0,
  defaultValue = items ? escapeValue(items[defaultIndex]) : undefined,
  className,
  children,
  ...props
}: TabsProps) {
  const collection = useMemo<string[]>(() => [], []);
  const context = useMemo(() => ({ items, collection }), [items, collection]);

  return (
    <TabsRoot
      defaultValue={defaultValue}
      className={cn(
        cardVariants({ padding: "none" }),
        "my-7 flex flex-col",
        className,
      )}
      {...props}
    >
      {items ? (
        <TabsList>
          {items.map((item) => (
            <TabsTrigger key={item} value={escapeValue(item)}>
              {item}
            </TabsTrigger>
          ))}
        </TabsList>
      ) : null}
      <TabsContext.Provider value={context}>{children}</TabsContext.Provider>
    </TabsRoot>
  );
}

export function TabsList({
  className,
  ...props
}: ComponentProps<typeof PackageTabsList>) {
  return (
    <PackageTabsList
      className={cn(
        // Only phones scroll the row: scrolling would clip the thumb's glow.
        "not-prose mx-3 mt-3 max-w-[calc(100%-1.5rem)] [scrollbar-width:none] self-start max-sm:overflow-x-auto",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  ...props
}: ComponentProps<typeof PackageTabsContent>) {
  return (
    <PackageTabsContent
      forceMount
      className={cn(
        "prose-no-margin mt-0 rounded-xl p-4 text-[0.9375rem] data-[state=inactive]:hidden sm:p-5",
        className,
      )}
      {...props}
    />
  );
}

/** A panel in simple mode. Without a `value`, it pairs by order with `items`. */
export function Tab({
  value,
  ...props
}: Omit<ComponentProps<typeof PackageTabsContent>, "value"> & {
  value?: string;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("<Tab> must be inside <Tabs>");
  const index = useCollectionIndex(context.collection);
  const resolved = value ?? context.items?.at(index);
  if (!resolved) throw new Error("<Tab> needs a `value`");
  return <TabsContent value={escapeValue(resolved)} {...props} />;
}

/** This Tab's position among its siblings, by render order. */
function useCollectionIndex(collection: string[]) {
  const key = useId();
  useEffect(
    () => () => {
      const index = collection.indexOf(key);
      if (index !== -1) collection.splice(index, 1);
    },
    [key, collection],
  );
  if (!collection.includes(key)) collection.push(key);
  return collection.indexOf(key);
}
