import React, { useState, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { api } from '../services/api';
import { GitGraph, Filter, Info, Clock, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export const SkillGraphView: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchGraphData = async () => {
      setIsLoading(true);
      try {
        const data = await api.getSkillGraph();

        // Layout nodes in a clean DAG structure
        const layoutNodes: Node[] = data.nodes.map((n, idx) => {
          const col = idx % 3;
          const row = Math.floor(idx / 3);

          let bg = '#1e293b';
          let border = '#334155';
          let textColor = '#f8fafc';

          if (n.status === 'acquired') {
            bg = '#064e3b';
            border = '#10b981';
          } else if (n.status === 'missing') {
            bg = '#4c0519';
            border = '#f43f5e';
          } else if (n.status === 'foundation') {
            bg = '#312e81';
            border = '#6366f1';
          }

          return {
            id: n.id,
            position: { x: col * 260 + 40, y: row * 160 + 40 },
            data: {
              label: n.label,
              category: n.category,
              status: n.status,
              difficulty: n.difficulty || 'intermediate',
              estimatedHours: n.estimatedHours || 15,
            },
            style: {
              background: bg,
              color: textColor,
              border: `2px solid ${border}`,
              borderRadius: '12px',
              padding: '12px',
              fontSize: '12px',
              fontWeight: '600',
              width: 200,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            },
          };
        });

        const flowEdges: Edge[] = data.edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          animated: true,
          label: e.label || 'prerequisite',
          style: { stroke: '#818cf8', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#818cf8',
          },
        }));

        setNodes(layoutNodes);
        setEdges(flowEdges);
      } catch (err) {
        console.error('Failed to load skill graph', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGraphData();
  }, []);

  const onNodeClick = (_: any, node: Node) => {
    setSelectedNode(node);
  };

  const filteredNodes = useMemo(() => {
    if (selectedCategory === 'all') return nodes;
    return nodes.filter((n) => n.data.category === selectedCategory);
  }, [nodes, selectedCategory]);

  return (
    <div className="space-y-4 h-[calc(100vh-6.5rem)] flex flex-col">
      {/* Top Header & Filter Controls */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-2">
            <GitGraph className="w-5 h-5 text-indigo-400" />
            Interactive Skill Graph (Prerequisite DAG)
          </h1>
          <p className="text-xs text-slate-400">
            Interactive Directed Acyclic Graph connecting acquired foundations to missing target competencies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Legend */}
          <div className="flex items-center gap-3 text-xs pr-4 border-r border-slate-800">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Acquired
            </span>
            <span className="flex items-center gap-1.5 text-rose-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Missing Target
            </span>
            <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Prerequisite
            </span>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none"
            >
              <option value="all">All Categories</option>
              <option value="languages">Languages</option>
              <option value="frameworks">Frameworks</option>
              <option value="databases">Databases</option>
              <option value="cloud">Cloud & DevOps</option>
              <option value="tools">Tools & Architecture</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Flow Canvas & Details Drawer */}
      <div className="flex-1 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden relative flex">
        <div className="flex-1 h-full relative">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              Generating dynamic skill graph layout...
            </div>
          ) : (
            <ReactFlow
              nodes={filteredNodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              fitView
              minZoom={0.2}
              maxZoom={2}
            >
              <Background color="#1e293b" gap={16} />
              <Controls className="bg-slate-900 border-slate-700 fill-white" />
              <MiniMap
                nodeColor={(n: any) =>
                  n.data.status === 'acquired'
                    ? '#10b981'
                    : n.data.status === 'missing'
                    ? '#f43f5e'
                    : '#6366f1'
                }
                style={{ backgroundColor: '#0f172a' }}
              />
            </ReactFlow>
          )}
        </div>

        {/* Node Detail Drawer */}
        {selectedNode && (
          <div className="w-80 border-l border-slate-800 bg-slate-900 p-5 overflow-y-auto space-y-4 animate-fade-in shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Skill Inspection
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">{selectedNode.data.label}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                  {selectedNode.data.category}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    selectedNode.data.status === 'acquired'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {selectedNode.data.status}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Difficulty:</span>
                <span className="font-semibold capitalize">{selectedNode.data.difficulty}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Target Study Time:</span>
                <span className="font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  {selectedNode.data.estimatedHours} hours
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-400">
              <p className="font-semibold text-slate-300">Prerequisite Ordering Rule:</p>
              <p className="text-[11px] leading-relaxed">
                Foundational concepts are topologically locked until parent nodes are either acquired on your resume or passed via authoritative skill assessments.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
