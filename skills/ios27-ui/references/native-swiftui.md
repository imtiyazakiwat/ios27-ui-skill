# Native SwiftUI / UIKit (iOS 26 / 27)

Rule zero: **use system components and let the OS draw Liquid Glass.** Rebuild the SDK with Xcode 26/27 and most chrome
adopts the new design automatically. In the iOS 27 SDK `UIDesignRequiresCompatibility` is ignored — you cannot opt out.
Do not fake glass behind system bars; custom `glassEffect` is only for your own floating controls.

APIs marked † are new in iOS 27 or from sources that should be checked against current Apple docs before use.

## Component mapping

| Need | SwiftUI | UIKit |
| --- | --- | --- |
| Tabs (nav only) | `TabView { Tab("Trips", systemImage: "…") { … } }`, `Tab(role: .search)`, `.tabBarMinimizeBehavior(.onScrollDown)` | `UITabBarController` |
| Per-tab stack | `NavigationStack(path:)` per tab, `.navigationDestination(for:)` | `UINavigationController` |
| Large title | `.navigationTitle("Fleet")` `.navigationBarTitleDisplayMode(.large)`; `.navigationSubtitle` | `prefersLargeTitles` |
| Primary action | `.toolbar { ToolbarItem(placement: .primaryAction) { Button("Add", systemImage: "plus") {} } }` | `UIBarButtonItem` |
| Group / separate glass | `ToolbarItemGroup`, `ToolbarSpacer(.fixed)`, `.sharedBackgroundVisibility(.hidden)` | `hidesSharedBackground` |
| Overflow / priority † | `.visibilityPriority`, `toolbarOverflowMenu`, `topBarPinnedTrailing` (WWDC26) | — |
| Lists | `List { Section("…") { … } }` `.listStyle(.insetGrouped)`; `Form` for editors | `UITableView` insetGrouped / `UICollectionView` list |
| Row | `NavigationLink`, `LabeledContent`, `Label("Title", systemImage:)` | `UIListContentConfiguration` |
| Swipe | `.swipeActions(edge: .trailing) { Button(role: .destructive) {} }` | `UISwipeActionsConfiguration` |
| Menu | `Menu { … } label: { Image(systemName: "ellipsis") }`, `Picker(…).pickerStyle(.menu)` | `UIMenu` |
| Context menu | `.contextMenu` | `UIContextMenuInteraction` |
| Sheet | `.sheet(item:)` `.presentationDetents([.medium, .large])` `.presentationDragIndicator(.visible)` | `UISheetPresentationController` |
| Sheet buttons | `ToolbarItem(placement: .cancellationAction) { Button(role: .close) {} }`; `ToolbarItem(placement: .confirmationAction) { Button(role: .confirm) {} }` | — |
| Dirty form guard | `.interactiveDismissDisabled(isDirty)` + `.confirmationDialog` | `isModalInPresentation` |
| Confirm destructive | `.confirmationDialog("Delete?", isPresented:) { Button("Delete", role: .destructive) {} }` | `UIAlertController(.actionSheet)` |
| Search | `.searchable(text:)` (iOS 26: bottom on iPhone), `.searchScopes`, `.searchSuggestions` | `UISearchController` |
| Empty | `ContentUnavailableView("No Trips", systemImage: "…", description: Text("…"))` | `UIContentUnavailableConfiguration` |
| Buttons | `.buttonStyle(.borderedProminent)` / `.glassProminent` / `.glass`, `.controlSize(.large)` | `UIButton.Configuration` |
| Custom glass (floating only) | `.glassEffect(.regular.interactive(), in: .capsule)` in a `GlassEffectContainer` | `UIGlassEffect` |
| Concentric corners | `ConcentricRectangle`, `.containerShape(…)` | `UICornerConfiguration` |
| Nav transition | `.navigationTransition(.zoom(sourceID:in:))` | zoom transition |
| Springs | `withAnimation(.smooth)`, `.snappy`, `.bouncy`, `.spring(duration:bounce:)` | `UIView.animate(springDuration:bounce:)` |
| Haptics | `.sensoryFeedback(.selection, trigger:)` | `UIImpactFeedbackGenerator` |

## Rules
- SF Symbols for every icon (regular weight; filled when selected). Colors: semantic (`.primary`, `.secondary`, `Color(.systemGroupedBackground)`,
  `.tint`). Text: Dynamic Type styles (`.largeTitle`, `.headline`, `.body`, `.subheadline`, `.footnote`) — never fixed point sizes.
- Don't put `.background(.ultraThinMaterial)` behind toolbars/tab bars; don't tint bars with brand color (glass signals navigation).
- Data entry in sheets: `Form`, `TextField`, `DatePicker(.compact)`, `Picker(.menu)`; amount-first with `.keyboardType(.decimalPad)`.
- Accessibility labels on icon-only buttons; test Dynamic Type XXL, Reduce Transparency, Increase Contrast, Reduce Motion, Dark.
- Navigation: `Hashable` route enum per tab; keep `@State var path` per tab so tabs preserve stacks.

## Minimal skeleton
```swift
struct RootView: View {
  var body: some View {
    TabView {
      Tab("Today", systemImage: "house") { NavigationStack { TodayView() } }
      Tab("Trips", systemImage: "point.topleft.down.curvedto.point.bottomright.up") { NavigationStack { TripsView() } }
      Tab("Fleet", systemImage: "truck.box") { NavigationStack { FleetView() } }
      Tab("Drivers", systemImage: "person.2") { NavigationStack { DriversView() } }
    }
    .tabBarMinimizeBehavior(.onScrollDown)
  }
}
struct FleetView: View {
  @State private var showNew = false
  var body: some View {
    List {
      Section("On Trip · 2") { ForEach(onTrip) { TruckRow(truck: $0) } }
    }
    .listStyle(.insetGrouped)
    .navigationTitle("Fleet")
    .toolbar { ToolbarItem(placement: .primaryAction) { Button("Add Truck", systemImage: "plus") { showNew = true } } }
    .sheet(isPresented: $showNew) { NavigationStack { TruckForm() }.presentationDetents([.large]) }
  }
}
```
Verify symbol names exist in your SF Symbols version before shipping.
