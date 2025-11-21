"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { GraphData, GraphNode } from "@/lib/graph/types";
import { useGraphSearch, SearchResult } from "@/hooks/use-graph-search";
import { Badge } from "@/components/ui/badge";
import { NODE_COLORS } from "@/lib/graph/styles";

interface GraphSearchProps {
  graphData: GraphData | null;
  currentLayer?: string;
  onNodeSearch?: (nodeId: string, connectedNodeIds: Set<string>) => void;
  onClearSearch?: () => void;
}

function SearchSuggestion({
  result,
  onClick,
  isActive,
}: {
  result: SearchResult;
  onClick: () => void;
  isActive: boolean;
}) {
  const color = NODE_COLORS[result.node.type] || NODE_COLORS.default;

  return (
    <div
      className={`flex items-center justify-between px-3 py-2 cursor-pointer text-sm transition-colors ${
        isActive ? "bg-sidebar-accent" : "hover:bg-sidebar-accent"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div
          className="h-2 w-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate">{result.node.name}</span>
          <span className="text-xs text-muted-foreground">
            {result.node.type}
          </span>
        </div>
      </div>
      {result.matchScore >= 500 && (
        <Badge variant="secondary" className="text-xs ml-2">
          exact
        </Badge>
      )}
    </div>
  );
}

export function GraphSearch({
  graphData,
  currentLayer,
  onNodeSearch,
  onClearSearch,
}: GraphSearchProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const { searchTerm, setSearchTerm, suggestions, searchAndHighlight } =
    useGraphSearch(graphData);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [hasActiveSearch, setHasActiveSearch] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Clear search when layer changes
  useEffect(() => {
    setSearchTerm("");
    setShowSuggestions(false);
    setHasActiveSearch(false);
    setActiveSuggestionIndex(0);
    onClearSearch?.();
  }, [currentLayer, onClearSearch]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setShowSuggestions(value.length >= 2);
    setActiveSuggestionIndex(0);
  };

  const handleSelectNode = (node: GraphNode) => {
    const result = searchAndHighlight(node.id);

    if (result) {
      setSearchTerm(node.name);
      setShowSuggestions(false);
      setHasActiveSearch(true);

      if (onNodeSearch) {
        onNodeSearch(result.node.id, result.connectedNodeIds);
      }
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setShowSuggestions(false);
    setHasActiveSearch(false);
    setActiveSuggestionIndex(0);
    onClearSearch?.();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (suggestions[activeSuggestionIndex]) {
          handleSelectNode(suggestions[activeSuggestionIndex].node);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowSuggestions(false);
        break;
    }
  };

  const handleFocus = () => {
    if (searchTerm.length >= 2) {
      setShowSuggestions(true);
    }
  };

  if (isCollapsed) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Search">
                <Search className="size-5" />
                {hasActiveSearch && (
                  <div className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  const nodeCount = graphData?.nodes?.length || 0;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Search</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="px-2 py-1 space-y-2 relative">
              <div className="flex items-center gap-2">
                <Search className="size-4" />
                <span className="text-sm font-medium">Search Nodes</span>
              </div>

              {/* Show node count */}
              {nodeCount > 0 && (
                <div className="text-xs text-muted-foreground px-2">
                  {nodeCount} nodes available
                </div>
              )}

              <div className="relative">
                <Input
                  ref={inputRef}
                  placeholder="Type to search..."
                  className="h-9 pr-8"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={handleFocus}
                  disabled={!graphData || nodeCount === 0}
                />
                {(searchTerm || hasActiveSearch) && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {/* Autocomplete suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute left-2 right-2 top-full mt-1 z-50 bg-popover border rounded-md shadow-md max-h-64 overflow-y-auto"
                >
                  {suggestions.map((result, index) => (
                    <SearchSuggestion
                      key={result.node.id}
                      result={result}
                      isActive={index === activeSuggestionIndex}
                      onClick={() => handleSelectNode(result.node)}
                    />
                  ))}
                </div>
              )}

              {/* Search stats */}
              {showSuggestions &&
                suggestions.length === 0 &&
                searchTerm.length >= 2 && (
                  <div className="text-xs text-muted-foreground px-2">
                    No results found for "{searchTerm}"
                  </div>
                )}

              {hasActiveSearch && !showSuggestions && (
                <div className="text-xs text-muted-foreground px-2">
                  Showing node and connections
                </div>
              )}

              {/* No data message */}
              {(!graphData || nodeCount === 0) && (
                <div className="text-xs text-muted-foreground px-2">
                  No graph data available
                </div>
              )}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
