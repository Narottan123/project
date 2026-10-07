"use client";

import React, { useState, useEffect, useCallback } from "react";
import { postsApi } from "@/service/api";
import PostCard from "@/components/blog/PostCard";
import CategoryFilter from "@/components/blog/CategoryFilter";
import Pagination from "@/components/common/Pagination";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { FiSearch, FiFileText } from "react-icons/fi";

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
        limit: 10,
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

  const handleResetFilters = () => {
    setSelectedCategory("All");
    setSearchTerm("");
    setPage(1);
  };

  return (
    <div>
      {/* Hero / Header Bar */}
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
        {/* Category Filters */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setPage(1);
          }}
          currentCount={posts.length}
          totalCount={totalPosts}
        />

        {/* Post Grid or States */}
        {loading ? (
          <LoadingSpinner message="Loading latest articles..." minHeight="30vh" />
        ) : posts.length === 0 ? (
          <EmptyState
            icon={<FiFileText size={48} />}
            title="No articles found"
            description="Try clearing filters or search terms to see more articles."
            action={
              <button
                type="button"
                onClick={handleResetFilters}
                className="blog-btn-outline"
              >
                Reset Filters
              </button>
            }
          />
        ) : (
          <div className="row g-4">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        <Pagination
          page={page}
          totalPages={totalPages}
          total={totalPosts}
          limit={10}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>
    </div>
  );
}
