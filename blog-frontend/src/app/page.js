"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { postsApi } from "@/service/api";
import PostCard from "@/components/blog/PostCard";
import { FiSearch, FiEdit, FiTrendingUp, FiFilter } from "react-icons/fi";

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 9,
        category: selectedCategory !== "All" ? selectedCategory : undefined,
        search: searchTerm.trim() || undefined,
      };

      const res = await postsApi.getPosts(params);
      if (res.data?.success) {
        setPosts(res.data.data || []);
        if (res.data.extra) {
          setTotalPages(res.data.extra.totalPages || 1);
          setTotalPosts(res.data.extra.total || 0);
        }
      }
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, searchTerm]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const catRes = await postsApi.getCategories();
        if (catRes.data?.success) {
          setCategories(["All", ...(catRes.data.data || [])]);
        }
      } catch (e) {
        console.error("Failed to load categories:", e);
      }
    };
    fetchMeta();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  return (
    <div>
      {/* Page Header */}
      <div className="bg-white border-bottom py-4 mb-4">
        <div className="container">
          <div className="row align-items-center justify-content-between">
            <div className="col-md-7 mb-3 mb-md-0">
              <h1 className="h3 fw-bold mb-1 text-dark">DevBlog Articles</h1>
              <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
                Browse articles, tutorials, and discussions created by the community.
              </p>
            </div>
            <div className="col-md-5">
              <form onSubmit={handleSearchSubmit}>
                <div className="input-group">
                  <span className="input-group-text bg-white text-muted">
                    <FiSearch />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary">
                    Search
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container pb-5">
        {/* Category Filter & Count */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4 pb-3 border-bottom">
          <div className="d-flex align-items-center gap-2 overflow-x-auto py-1">
            <span className="text-muted d-flex align-items-center gap-1 me-1" style={{ fontSize: "13px" }}>
              <FiFilter /> Category:
            </span>
            {categories.map((cat, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setPage(1);
                }}
                className={`btn btn-sm ${
                  selectedCategory === cat
                    ? "btn-primary"
                    : "btn-outline-secondary"
                }`}
                style={{ fontSize: "13px" }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="text-muted" style={{ fontSize: "13px" }}>
            Showing <strong>{posts.length}</strong> of <strong>{totalPosts}</strong> posts
          </div>
        </div>

        {/* Post Grid */}
        {loading ? (
          <div className="row g-4 justify-content-center py-5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="col-lg-4 col-md-6">
                <div className="blog-card p-4 text-center">
                  <div className="spinner-border text-primary my-5" role="status" />
                  <p className="text-muted">Loading latest articles...</p>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-5 my-4">
            <h4 className="fw-bold text-muted mb-2">No articles found</h4>
            <p className="text-muted mb-4">Try clearing filters or search terms.</p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchTerm("");
                setPage(1);
              }}
              className="blog-btn-outline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center align-items-center gap-2 mt-5">
            <button
              className="btn btn-outline-secondary px-3 py-1 rounded-pill"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{ fontSize: "13px" }}
            >
              &larr; Previous
            </button>
            <span className="px-3 text-muted" style={{ fontSize: "13px" }}>
              Page {page} of {totalPages}
            </span>
            <button
              className="btn btn-outline-secondary px-3 py-1 rounded-pill"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{ fontSize: "13px" }}
            >
              Next &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
